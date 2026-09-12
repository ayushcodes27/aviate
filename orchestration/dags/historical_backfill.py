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

# Define a dictionary or list of historical periods and files
BACKFILL_PERIODS = {
    "2023-01": "T_ONTIME_MARKETING_2023_1.csv",
    "2023-02": "T_ONTIME_MARKETING_2023_2.csv",
    "2023-03": "T_ONTIME_MARKETING_2023_3.csv"
}

with DAG(
    'historical_backfill',
    default_args=default_args,
    description='Backfill historical BTS flight data',
    schedule_interval=None,
    start_date=datetime(2023, 1, 1),
    catchup=False,
) as dag:

    start = EmptyOperator(task_id='start')
    end = EmptyOperator(task_id='end')

    dbt_build = BashOperator(
        task_id='dbt_build_all',
        bash_command='cd /opt/airflow/transform && dbt build --profiles-dir /opt/airflow/transform',
        env={"POSTGRES_HOST": "postgres", "POSTGRES_USER": "postgres", "POSTGRES_PASSWORD": "postgres", "POSTGRES_DB": "aviate_dw"}
    )

    for period, filename in BACKFILL_PERIODS.items():
        download_data = BashOperator(
            task_id=f'download_bts_data_{period}',
            bash_command=f'python /opt/airflow/ingestion/download_bts.py --file {filename} --period {period}'
        )

        spark_process = BashOperator(
            task_id=f'spark_process_{period}',
            bash_command=f'python /opt/airflow/processing/spark_flights.py --file {filename} --period {period}'
        )

        start >> download_data >> spark_process >> dbt_build
    
    dbt_build >> end
