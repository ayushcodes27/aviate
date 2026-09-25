from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.workflow import Airflow
from diagrams.onprem.analytics import Dbt
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.client import Client
from diagrams.programming.framework import React
from diagrams.programming.language import Python
from diagrams.generic.storage import Storage

graph_attr = {
    "fontsize": "24",
    "bgcolor": "#0d1117",
    "fontcolor": "#f0f6fc",
    "pad": "0.8",
    "splines": "curved",
    "nodesep": "0.9",
    "ranksep": "1.2",
}

node_attr = {
    "fontcolor": "#ffffff",
    "fontsize": "13",
}

with Diagram(
    "Aviate — Modern Data Pipeline Architecture",
    show=False,
    filename="aviate_architecture",
    outformat="png",
    graph_attr=graph_attr,
    node_attr=node_attr,
    direction="LR",
):
    with Cluster("1. Ingestion Source", graph_attr={"bgcolor": "#161b22", "fontcolor": "#58a6ff"}):
        bts_source = Storage("BTS TranStats CSVs\n(6.4M Records)")

    with Cluster("2. Orchestration", graph_attr={"bgcolor": "#161b22", "fontcolor": "#58a6ff"}):
        airflow = Airflow("Apache Airflow 2.9\n(DAG Scheduler)")

    with Cluster("3. In-Process Processing & Staging Warehouse", graph_attr={"bgcolor": "#161b22", "fontcolor": "#58a6ff"}):
        duckdb = Python("DuckDB Engine\n(Vectorized Clean & Cast)")
        staging_pg = PostgreSQL("Local PostgreSQL\n(Staging DW)")
        dbt_marts = Dbt("dbt Core 1.12\n(5 Marts · 12 Tests)")

    with Cluster("4. Cloud Serving Layer", graph_attr={"bgcolor": "#161b22", "fontcolor": "#58a6ff"}):
        sync_job = Client("publish_marts.py\n(Batched Sync)")
        supabase = PostgreSQL("Supabase Cloud DB\n(Serving DW)")

    with Cluster("5. Presentation Layer", graph_attr={"bgcolor": "#161b22", "fontcolor": "#58a6ff"}):
        dashboard = React("Next.js 15 App\n(Operations Dashboard)")

    # Data pipeline flows
    bts_source >> Edge(color="#8b949e", style="bold") >> duckdb
    airflow >> Edge(color="#a371f7", style="dashed", label="orchestrates") >> duckdb
    duckdb >> Edge(color="#3fb950", style="bold", label="bulk COPY") >> staging_pg
    airflow >> Edge(color="#a371f7", style="dashed") >> dbt_marts
    staging_pg >> Edge(color="#d29922", style="bold") >> dbt_marts
    dbt_marts >> Edge(color="#d29922", style="bold") >> staging_pg
    staging_pg >> Edge(color="#58a6ff", style="bold", label="sync") >> sync_job
    sync_job >> Edge(color="#58a6ff", style="bold") >> supabase
    supabase >> Edge(color="#f778ba", style="bold", label="queries") >> dashboard
