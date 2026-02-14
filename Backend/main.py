import uvicorn
from dotenv import load_dotenv
import os

# Load environment variables from .env
print(f"🔍 Loading environment from: {os.path.abspath('.env')}")
load_dotenv(override=True)

key = os.getenv("API_KEY")
if key:
    print(f"✅ Environment Loaded. API Key found: {key[:8]}...{key[-4:]}")
else:
    print("❌ Environment Error: API_KEY or API_KEY not found in .env.")

from app.app import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
