import argparse
import sys
import psycopg2
from pathlib import Path

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, current_timestamp
from pyspark.sql.types import IntegerType, DateType, StringType

# Add parent directory to path to allow imports from config
sys.path.append(str(Path(__file__).resolve().parent.parent))
from ingestion.config import RAW_DIR, PROCESSED_DIR, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT, logger

def get_spark_session(app_name: str = "AviateSparkBatch") -> SparkSession:
    # Need Postgres JDBC driver for writing to the DB
    return SparkSession.builder \
        .appName(app_name) \
        .config("spark.jars.packages", "org.postgresql:postgresql:42.6.0") \
        .getOrCreate()

def process_and_load(spark: SparkSession, filename: str, period: str):
    filepath = str(RAW_DIR / filename)
    logger.info(f"Reading raw file from {filepath}")
    
    # BTS data is usually CSV
    df = spark.read.csv(filepath, header=True, inferSchema=True)
    
    # 1. Select and rename columns to match our raw_flights schema
    # Note: Column names in BTS CSV can vary slightly, assuming standard ones for now.
    # Adjust these mappings based on the actual CSV headers.
    col_mapping = {
        "FL_DATE": "flight_date",
        "AIRLINE": "carrier",
        "ORIGIN": "origin",
        "DEST": "dest",
        "DEP_TIME": "dep_time",
        "DEP_DELAY": "dep_delay",
        "ARR_TIME": "arr_time",
        "ARR_DELAY": "arr_delay",
        "CANCELLED": "cancelled",
        "CANCELLATION_CODE": "cancellation_code",
        "DIVERTED": "diverted",
        "DELAY_DUE_CARRIER": "carrier_delay",
        "DELAY_DUE_WEATHER": "weather_delay",
        "DELAY_DUE_NAS": "nas_delay",
        "DELAY_DUE_SECURITY": "security_delay",
        "DELAY_DUE_LATE_AIRCRAFT": "late_aircraft_delay"
    }
    
    for original, new_name in col_mapping.items():
        if original in df.columns:
            df = df.withColumnRenamed(original, new_name)
    
    # Drop any columns that were not in our mapping
    valid_cols = list(col_mapping.values())
    df = df.select([c for c in df.columns if c in valid_cols])
    
    # Add ingestion timestamp
    df = df.withColumn("_ingested_at", current_timestamp())
    
    # 2. Quality Validation
    # Required columns should not be null
    required_cols = ["flight_date", "carrier", "origin", "dest"]
    for c in required_cols:
        if c in df.columns:
            df = df.filter(col(c).isNotNull())
    
    row_count = df.count()
    logger.info(f"Validated dataset contains {row_count} records.")
    
    if row_count == 0:
        logger.warning("No records to process after validation!")
        return
        
    # 3. Write Parquet to Processed zone
    parquet_path = str(PROCESSED_DIR / filename.replace(".csv", ".parquet"))
    logger.info(f"Writing to parquet: {parquet_path}")
    df.write.mode("overwrite").parquet(parquet_path)
    
    # 4. Load to Postgres using JDBC
    jdbc_url = f"jdbc:postgresql://{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    
    logger.info(f"Deleting existing records for period {period} to ensure idempotency...")
    conn = psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD
    )
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("DELETE FROM raw_flights WHERE TO_CHAR(flight_date, 'YYYY-MM') = %s", (period,))
    cursor.close()
    conn.close()
    logger.info(f"Deleted existing records for {period}.")

    logger.info(f"Loading data into PostgreSQL table 'raw_flights' at {jdbc_url}")
    
    df.write \
        .format("jdbc") \
        .option("url", jdbc_url) \
        .option("dbtable", "raw_flights") \
        .option("user", POSTGRES_USER) \
        .option("password", POSTGRES_PASSWORD) \
        .option("driver", "org.postgresql.Driver") \
        .mode("append") \
        .save()
        
    logger.info("Successfully loaded into Postgres.")

def main():
    parser = argparse.ArgumentParser(description="Process BTS flight data with Spark")
    parser.add_argument("--file", required=True, help="Filename inside data/raw/")
    parser.add_argument("--period", required=True, help="Period (e.g. 2023-01)")
    args = parser.parse_args()
    
    spark = get_spark_session()
    try:
        process_and_load(spark, args.file, args.period)
    finally:
        spark.stop()

if __name__ == "__main__":
    main()
