from app.database import engine
from sqlalchemy import text

def update_db():
    with engine.connect() as conn:
        print("Checking for s3_key column...")
        try:
            conn.execute(text("ALTER TABLE wells ADD COLUMN s3_key VARCHAR;"))
            conn.commit()
            print("Successfully added s3_key column to wells table.")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("Column s3_key already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    update_db()
