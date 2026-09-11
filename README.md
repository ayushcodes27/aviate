# 🎬 Flick — Multi-Source Movie Analytics Platform

**Flick** is an end-to-end data engineering and analytics platform that ingests, processes, transforms, and analyzes movie data from multiple sources (TMDB, OMDb, IMDb, Rotten Tomatoes) at scale. It normalizes disparate rating scales and surfaces cross-platform insights such as critic vs. audience disagreements, director consistency, and sequel quality trends.

---

## 🏗️ Architecture

```text
┌────────────────────── Docker Compose (Local) ──────────────────────┐
│                                                                     │
│  [Python Producers] ──→ [Kafka] ──→ [Spark] ──→ [PostgreSQL]      │
│   • TMDB API              3 topics   Process      Raw tables        │
│   • OMDb API                         & Match                       │
│                                                         │          │
│  [Airflow] orchestrates entire pipeline                 ▼          │
│   • Daily DAG                                       [dbt]          │
│   • Weekly full refresh                          4-layer transform │
│                                                         │          │
└─────────────────────────────────────────────────────────┼──────────┘
                                                          │
                                              Sync to cloud DB
                                                          │
                                    ┌─────────────────────▼──────────┐
                                    │  Supabase (Cloud PostgreSQL)   │
                                    └─────────────────────┬──────────┘
                                                          │
                                    ┌─────────────────────▼──────────┐
                                    │  Next.js Dashboard (Vercel)    │
                                    │  Charts · Cards · Comparisons  │
                                    └────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Ingestion:** Python (TMDB & OMDb API clients)
- **Message Broker:** Apache Kafka
- **Processing Engine:** Apache Spark (PySpark)
- **Orchestration:** Apache Airflow
- **Data Transformation & Modeling:** dbt (raw → staging → intermediate → marts)
- **Storage / Warehouse:** PostgreSQL (local) & Supabase (cloud)
- **Serving / Frontend:** Next.js, React, Recharts / Nivo
- **Infrastructure:** Docker Compose

---

## 📁 Repository Structure

```text
flick/
├── ingestion/              # API producers streaming to Kafka
├── processing/             # Spark processing, ID matching, & normalization
├── orchestration/          # Airflow DAGs & workflows
│   └── dags/
├── transform/              # dbt models (staging, intermediate, marts)
├── sync/                   # Cloud database synchronization scripts
├── dashboard/              # Next.js analytical web application
├── docker-compose.yml      # Local services orchestration
├── .env.example            # Environment variables template
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.12+
- Node.js 18+

### 2. Environment Setup
Clone the repository and copy the environment template:
```bash
cp .env.example .env
```
Update `.env` with your API keys (TMDB, OMDb) and database credentials.
