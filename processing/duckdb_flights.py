import argparse
import io
import sys
from pathlib import Path
import duckdb
import psycopg2

# Add parent directory to path to allow imports from config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from ingestion.config import (
    RAW_DIR,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PORT,
    logger,
)

COLUMNS = [
    "flight_date",
    "carrier",
    "origin",
    "dest",
    "dep_time",
    "dep_delay",
    "arr_time",
    "arr_delay",
    "cancelled",
    "cancellation_code",
    "diverted",
    "carrier_delay",
    "weather_delay",
    "nas_delay",
    "security_delay",
    "late_aircraft_delay",
]


def process_and_load(filename: str, period: str):
    filepath = RAW_DIR / filename
    if not filepath.exists():
        raise FileNotFoundError(f"Source file not found: {filepath}")

    logger.info(f"Processing {filepath} with DuckDB for period {period}...")

    con = duckdb.connect()

    # Read CSV, map headers, cast types, and filter required nulls in DuckDB SQL
    query = f"""
    SELECT
        TRY_CAST(FL_DATE AS DATE) AS flight_date,
        CAST(AIRLINE AS VARCHAR) AS carrier,
        CAST(ORIGIN AS VARCHAR) AS origin,
        CAST(DEST AS VARCHAR) AS dest,
        TRY_CAST(DEP_TIME AS INTEGER) AS dep_time,
        TRY_CAST(DEP_DELAY AS INTEGER) AS dep_delay,
        TRY_CAST(ARR_TIME AS INTEGER) AS arr_time,
        TRY_CAST(ARR_DELAY AS INTEGER) AS arr_delay,
        TRY_CAST(CANCELLED AS INTEGER) AS cancelled,
        CAST(CANCELLATION_CODE AS VARCHAR) AS cancellation_code,
        TRY_CAST(DIVERTED AS INTEGER) AS diverted,
        TRY_CAST(DELAY_DUE_CARRIER AS INTEGER) AS carrier_delay,
        TRY_CAST(DELAY_DUE_WEATHER AS INTEGER) AS weather_delay,
        TRY_CAST(DELAY_DUE_NAS AS INTEGER) AS nas_delay,
        TRY_CAST(DELAY_DUE_SECURITY AS INTEGER) AS security_delay,
        TRY_CAST(DELAY_DUE_LATE_AIRCRAFT AS INTEGER) AS late_aircraft_delay
    FROM read_csv_auto('{filepath.as_posix()}', header=True)
    WHERE FL_DATE IS NOT NULL
      AND AIRLINE IS NOT NULL
      AND ORIGIN IS NOT NULL
      AND DEST IS NOT NULL
    """

    con.execute(f"CREATE TEMP TABLE cleaned_flights AS {query}")
    row_count = con.execute("SELECT COUNT(*) FROM cleaned_flights").fetchone()[0]
    logger.info(f"Validated dataset contains {row_count:,} records.")

    if row_count == 0:
        logger.warning("No records to process after validation!")
        return

    # Connect to PostgreSQL
    pg_conn = psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
    )
    pg_conn.autocommit = True

    try:
        with pg_conn.cursor() as cur:
            logger.info(f"Truncating raw_flights table before loading period {period}...")
            cur.execute("TRUNCATE TABLE raw_flights")

            logger.info("Streaming validated rows from DuckDB into PostgreSQL...")
            csv_buffer = io.StringIO()
            # DuckDB write to csv buffer in memory for PostgreSQL COPY
            df = con.execute("SELECT * FROM cleaned_flights").df()
            df.to_csv(csv_buffer, index=False, header=False)
            csv_buffer.seek(0)

            cols_str = ", ".join(COLUMNS)
            copy_sql = f"COPY raw_flights ({cols_str}) FROM STDIN WITH (FORMAT CSV)"
            cur.copy_expert(copy_sql, csv_buffer)

        logger.info(f"Successfully loaded {row_count:,} records into PostgreSQL.")
    finally:
        pg_conn.close()
        con.close()


def main():
    parser = argparse.ArgumentParser(description="Process BTS flight data with DuckDB")
    parser.add_argument("--file", required=True, help="Filename inside data/raw/")
    parser.add_argument("--period", required=True, help="Period (e.g. 2023-01)")
    args = parser.parse_args()

    process_and_load(args.file, args.period)


if __name__ == "__main__":
    main()
