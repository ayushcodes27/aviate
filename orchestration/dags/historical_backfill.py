from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.empty import EmptyOperator

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Define historical periods and files
BACKFILL_PERIODS = {
    "2023-Q1": "flights_sample_3m.csv"
}

with DAG(
    'historical_backfill',
    default_args=default_args,
    description='Backfill historical BTS flight data via DuckDB and dbt',
    schedule_interval=None,
    start_date=datetime(2023, 1, 1),
    catchup=False,
) as dag:

    PG_ENV = {
        "POSTGRES_HOST": "postgres",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "postgres",
        "POSTGRES_DB": "aviate_dw",
    }

    start = EmptyOperator(task_id='start')
    end = EmptyOperator(task_id='end')

    dbt_build = BashOperator(
        task_id='dbt_build_all',
        bash_command='cd /opt/airflow/transform && dbt build --profiles-dir /opt/airflow/transform',
        env=PG_ENV,
        append_env=True,
    )

    for period, filename in BACKFILL_PERIODS.items():
        register_data = BashOperator(
            task_id=f'register_bts_data_{period}',
            bash_command=f'python /opt/airflow/ingestion/register_bts.py --file {filename} --period {period}',
            env=PG_ENV,
            append_env=True,
        )

        duckdb_process = BashOperator(
            task_id=f'duckdb_process_{period}',
            bash_command=f'python /opt/airflow/processing/duckdb_flights.py --file {filename} --period {period}',
            env=PG_ENV,
            append_env=True,
        )

        start >> register_data >> duckdb_process >> dbt_build
    
    publish_marts = BashOperator(
        task_id='publish_marts',
        bash_command='python /opt/airflow/sync/publish_marts.py',
        env=PG_ENV,
        append_env=True,
    )

    dbt_build >> publish_marts >> end
