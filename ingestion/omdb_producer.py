import argparse
import json
import time
from datetime import datetime
from typing import Any, Dict, List, Optional
import requests
from kafka import KafkaProducer

from ingestion.config import (
    KAFKA_BOOTSTRAP_SERVERS,
    KAFKA_TOPIC_ERRORS,
    KAFKA_TOPIC_OMDB,
    OMDB_API_KEY,
    OMDB_BASE_URL,
    OMDB_RATE_LIMIT_DELAY,
    logger,
)


class OMDbProducer:
    """Producer that fetches movie rating details from OMDb API and streams JSON messages to Kafka."""

    def __init__(self, bootstrap_servers: Optional[str] = None):
        self.api_key = OMDB_API_KEY
        if not self.api_key:
            logger.warning("OMDB_API_KEY is not set. API calls will fail.")

        self.session = requests.Session()
        self.bootstrap_servers = bootstrap_servers or KAFKA_BOOTSTRAP_SERVERS
        self.producer = self._create_kafka_producer()

    def _create_kafka_producer(self) -> KafkaProducer:
        """Initialize Kafka Producer with JSON serialization."""
        return KafkaProducer(
            bootstrap_servers=self.bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: str(k).encode("utf-8") if k else None,
            retries=3,
            acks="all",
        )

    def fetch_movie_by_imdb_id(self, imdb_id: str) -> Optional[Dict[str, Any]]:
        """Fetch movie details by IMDb ID (e.g., 'tt0111161')."""
        if not imdb_id or not imdb_id.startswith("tt"):
            logger.warning(f"Invalid IMDb ID format: {imdb_id}")
            return None

        params = {
            "i": imdb_id,
            "apikey": self.api_key,
            "plot": "short",
        }

        try:
            time.sleep(OMDB_RATE_LIMIT_DELAY)
            response = self.session.get(OMDB_BASE_URL, params=params, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("Response") == "True":
                    return data
                else:
                    logger.warning(f"OMDb returned error for {imdb_id}: {data.get('Error')}")
                    return None
            else:
                logger.error(f"OMDb HTTP error {response.status_code} for {imdb_id}: {response.text}")
                return None
        except Exception as e:
            logger.error(f"Failed to fetch OMDb data for {imdb_id}: {e}")
            return None

    def stream_movies_by_imdb_ids(self, imdb_ids: List[str]) -> int:
        """Fetch OMDb metadata for a list of IMDb IDs and publish to Kafka."""
        total_produced = 0
        logger.info(f"Starting OMDb ingestion for {len(imdb_ids)} IMDb IDs...")

        for idx, imdb_id in enumerate(imdb_ids, 1):
            clean_id = imdb_id.strip()
            data = self.fetch_movie_by_imdb_id(clean_id)

            if not data:
                continue

            # Add ingestion metadata
            data["_ingestion_source"] = "omdb"
            data["_ingested_at"] = datetime.utcnow().isoformat()
            data["imdbID"] = clean_id

            try:
                self.producer.send(
                    topic=KAFKA_TOPIC_OMDB,
                    key=clean_id,
                    value=data,
                )
                total_produced += 1
                if idx % 25 == 0 or idx == len(imdb_ids):
                    logger.info(f"Ingested {idx}/{len(imdb_ids)} OMDb records...")
            except Exception as e:
                logger.error(f"Failed to publish OMDb data for {clean_id} to Kafka: {e}")
                self.producer.send(
                    topic=KAFKA_TOPIC_ERRORS,
                    key=clean_id,
                    value={"source": "omdb", "error": str(e), "data": data},
                )

        self.producer.flush()
        logger.info(f"Successfully produced {total_produced} OMDb records to Kafka topic '{KAFKA_TOPIC_OMDB}'.")
        return total_produced

    def close(self):
        """Flush and close Kafka producer."""
        if self.producer:
            self.producer.flush()
            self.producer.close()


def main():
    parser = argparse.ArgumentParser(description="OMDb API Kafka Producer")
    parser.add_argument(
        "--ids",
        type=str,
        nargs="+",
        help="Space-separated list of IMDb IDs (e.g., tt0111161 tt0068646 tt0468569)",
    )
    parser.add_argument(
        "--file",
        type=str,
        help="Path to a text file containing one IMDb ID per line",
    )
    args = parser.parse_args()

    imdb_ids = []
    if args.ids:
        imdb_ids.extend(args.ids)
    elif args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            imdb_ids = [line.strip() for line in f if line.strip()]
    else:
        # Default top iconic movie samples for quick testing
        imdb_ids = [
            "tt0111161",  # The Shawshank Redemption
            "tt0068646",  # The Godfather
            "tt0468569",  # The Dark Knight
            "tt0109830",  # Forrest Gump
            "tt1375666",  # Inception
            "tt0137523",  # Fight Club
            "tt0816692",  # Interstellar
            "tt0110912",  # Pulp Fiction
        ]
        logger.info("No IDs specified. Using default sample set of iconic movies for testing.")

    producer = OMDbProducer()
    try:
        producer.stream_movies_by_imdb_ids(imdb_ids)
    finally:
        producer.close()


if __name__ == "__main__":
    main()
