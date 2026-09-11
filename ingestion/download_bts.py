import argparse
import hashlib
import json
import os
from datetime import datetime
from pathlib import Path
from config import RAW_DIR, logger

def compute_checksum(filepath: Path) -> str:
    """Computes SHA-256 checksum of a file."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def register_file(filename: str, period: str):
    """Generates a manifest for a manually downloaded BTS file."""
    filepath = RAW_DIR / filename
    
    if not filepath.exists():
        logger.error(f"File not found: {filepath}")
        return
        
    logger.info(f"Computing checksum for {filename}...")
    checksum = compute_checksum(filepath)
    
    manifest_path = RAW_DIR / "manifest.json"
    manifest_data = {}
    
    if manifest_path.exists():
        with open(manifest_path, "r") as f:
            manifest_data = json.load(f)
            
    manifest_data[period] = {
        "filename": filename,
        "checksum": checksum,
        "registered_at": datetime.now(datetime.UTC).isoformat(),
        "source": "BTS TranStats"
    }
    
    with open(manifest_path, "w") as f:
        json.dump(manifest_data, f, indent=4)
        
    logger.info(f"Successfully registered {filename} for period {period} with checksum {checksum}")

def main():
    parser = argparse.ArgumentParser(description="Register manually downloaded BTS Flight Data")
    parser.add_argument("--file", required=True, help="Filename inside data/raw/")
    parser.add_argument("--period", required=True, help="Period (e.g., 2023-01)")
    args = parser.parse_args()
    
    register_file(args.file, args.period)

if __name__ == "__main__":
    main()
