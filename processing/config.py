import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=ROOT_DIR / ".env")
except ImportError:
    pass # In Docker, environment variables are passed directly

# Kafka Settings
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC_TMDB = os.getenv("KAFKA_TOPIC_TMDB", "tmdb-movies-raw")
KAFKA_TOPIC_OMDB = os.getenv("KAFKA_TOPIC_OMDB", "omdb-movies-raw")
KAFKA_TOPIC_ERRORS = os.getenv("KAFKA_TOPIC_ERRORS", "processing-errors")

# Postgres Warehouse Settings
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "aviate_dw")

POSTGRES_JDBC_URL = f"jdbc:postgresql://{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
POSTGRES_PROPERTIES = {
    "user": POSTGRES_USER,
    "password": POSTGRES_PASSWORD,
    "driver": "org.postgresql.Driver",
}
