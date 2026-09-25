#!/bin/bash
set -e
set -u

function create_user_and_database() {
	local database=$1
	echo "  Creating user and database '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

function initialize_aviate_schema() {
    echo "  Initializing schema for aviate_dw"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d "aviate_dw" <<-EOSQL
        CREATE TABLE IF NOT EXISTS raw_flights (
            flight_date DATE,
            carrier TEXT,
            origin TEXT,
            dest TEXT,
            dep_time INTEGER,
            dep_delay INTEGER,
            arr_time INTEGER,
            arr_delay INTEGER,
            cancelled INTEGER,
            cancellation_code TEXT,
            diverted INTEGER,
            carrier_delay INTEGER,
            weather_delay INTEGER,
            nas_delay INTEGER,
            security_delay INTEGER,
            late_aircraft_delay INTEGER,
            _ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
		create_user_and_database $db
	done
	echo "Multiple databases created"
    
    if echo "$POSTGRES_MULTIPLE_DATABASES" | grep -q "aviate_dw"; then
        initialize_aviate_schema
    fi
fi
