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

with DAG(
    'monthly_flight_refresh',
    default_args=default_args,
    description='Monthly refresh of BTS flight data',
    schedule_interval='@monthly',
    start_date=datetime(2023, 1, 1),
    catchup=False,
    params={
        "period": "2023-01",
        "filename": "T_ONTIME_MARKETING_2023_1.csv"
    }
) as dag:

    start = EmptyOperator(task_id='start')

    download_data = BashOperator(
        task_id='download_bts_data',
        bash_command='python /opt/airflow/ingestion/download_bts.py --file {{ params.filename }} --period {{ params.period }}'
    )

    spark_process = BashOperator(
        task_id='spark_process',
        bash_command='python /opt/airflow/processing/spark_flights.py --file {{ params.filename }} --period {{ params.period }}'
    )

    dbt_build = BashOperator(
        task_id='dbt_build',
        bash_command='cd /opt/airflow/transform && dbt build --profiles-dir /opt/airflow/transform',
        env={"POSTGRES_HOST": "postgres", "POSTGRES_USER": "postgres", "POSTGRES_PASSWORD": "postgres", "POSTGRES_DB": "aviate_dw"}
    )

    end = EmptyOperator(task_id='end')

    start >> download_data >> spark_process >> dbt_build >> end
