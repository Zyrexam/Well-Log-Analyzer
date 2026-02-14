import os
import boto3
from botocore.exceptions import ClientError
from pathlib import Path

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class StorageService:
    def __init__(self):
        self.s3_enabled = False
        self.bucket_name = os.getenv("AWS_S3_BUCKET")
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.region = os.getenv("AWS_REGION", "us-east-1")

        if self.bucket_name and self.aws_access_key and self.aws_secret_key:
            try:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=self.aws_access_key,
                    aws_secret_access_key=self.aws_secret_key,
                    region_name=self.region
                )
                self.s3_enabled = True
                print(f"INFO: S3 Storage enabled (Bucket: {self.bucket_name})")
            except Exception as e:
                print(f"WARNING: S3 initialization failed: {e}. Falling back to local storage.")
        else:
            print("INFO: S3 credentials not found. Using local storage only.")

    def store_file(self, filename: str, content: bytes) -> dict:
        """Stores file locally and attempts S3 upload if configured"""
        
        # 1. Always store locally as secondary/primary cache
        local_path = UPLOAD_DIR / filename
        with open(local_path, "wb") as f:
            f.write(content)
        
        s3_success = False
        s3_key = None

        # 2. Upload to S3 if enabled
        if self.s3_enabled:
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=filename,
                    Body=content
                )
                s3_success = True
                s3_key = f"s3://{self.bucket_name}/{filename}"
                print(f"SUCCESS: File uploaded to S3: {filename}")
            except ClientError as e:
                print(f"ERROR: S3 upload failed for {filename}: {e}")

        return {
            "local_path": str(local_path),
            "s3_stored": s3_success,
            "s3_key": s3_key
        }

storage_service = StorageService()
