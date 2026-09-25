import os
import sys
import socket
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

load_dotenv()

def get_db_host():
    try:
        socket.gethostbyname('postgres')
        return 'postgres'
    except socket.error:
        return 'localhost'

host = os.getenv("POSTGRES_HOST") or get_db_host()
default_port = "5432" if host == "postgres" else "5434"
port = os.getenv("POSTGRES_PORT", default_port)
user = os.getenv("POSTGRES_USER", "postgres")
password = os.getenv("POSTGRES_PASSWORD", "postgres")
db = os.getenv("POSTGRES_DB", "aviate_dw")

LOCAL_DB_URL = os.getenv("DATABASE_URL", f"postgresql://{user}:{password}@{host}:{port}/{db}")
REMOTE_DB_URL = os.getenv("SUPABASE_DB_URL")

MARTS = [
    "mart_airline_performance",
    "mart_airport_performance",
    "mart_route_reliability",
    "mart_delay_trends",
    "mart_delay_causes"
]

def get_table_schema(conn, table_name):
    query = f"""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '{table_name}' 
        ORDER BY ordinal_position;
    """
    with conn.cursor() as cur:
        cur.execute(query)
        return cur.fetchall()

def create_table_if_not_exists(remote_conn, table_name, schema):
    type_map = {
        'integer': 'INTEGER',
        'numeric': 'NUMERIC',
        'text': 'TEXT',
        'date': 'DATE',
        'timestamp without time zone': 'TIMESTAMP',
        'bigint': 'BIGINT',
        'double precision': 'DOUBLE PRECISION',
        'character varying': 'VARCHAR'
    }
    
    columns = []
    for col_name, data_type in schema:
        pg_type = type_map.get(data_type, 'TEXT')
        columns.append(f"{col_name} {pg_type}")
        
    query = f"CREATE TABLE IF NOT EXISTS {table_name} ({', '.join(columns)});"
    with remote_conn.cursor() as cur:
        cur.execute(query)
        # Ensure any new columns in local schema exist in remote table
        for col_name, data_type in schema:
            pg_type = type_map.get(data_type, 'TEXT')
            cur.execute(f"ALTER TABLE {table_name} ADD COLUMN IF NOT EXISTS {col_name} {pg_type};")
    remote_conn.commit()

def sync_mart(local_conn, remote_conn, table_name):
    print(f"Syncing {table_name}...", flush=True)
    
    schema = get_table_schema(local_conn, table_name)
    if not schema:
        print(f"Table {table_name} not found in local database. Skipping.", flush=True)
        return
        
    create_table_if_not_exists(remote_conn, table_name, schema)
    
    with local_conn.cursor() as cur:
        cur.execute(f"SELECT * FROM {table_name}")
        rows = cur.fetchall()
        
    if not rows:
        print(f"No rows found in {table_name}.", flush=True)
        return
        
    with remote_conn.cursor() as cur:
        cur.execute(f"TRUNCATE TABLE {table_name};")
        cols = [col[0] for col in schema]
        query = f"INSERT INTO {table_name} ({', '.join(cols)}) VALUES %s"
        execute_values(cur, query, rows, page_size=5000)
        
    remote_conn.commit()
    print(f"Successfully synced {len(rows)} rows for {table_name}.", flush=True)

def main():
    if not REMOTE_DB_URL:
        print("Error: SUPABASE_DB_URL is not set.")
        sys.exit(1)
        
    try:
        local_conn = psycopg2.connect(LOCAL_DB_URL)
        remote_conn = psycopg2.connect(REMOTE_DB_URL)
        
        for mart in MARTS:
            sync_mart(local_conn, remote_conn, mart)
            
    finally:
        if 'local_conn' in locals(): local_conn.close()
        if 'remote_conn' in locals(): remote_conn.close()

if __name__ == "__main__":
    main()
