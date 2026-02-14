import requests
import sys
import os

def test_upload(filename):
    url = "http://localhost:8000/wells/upload"
    
    if not os.path.exists(filename):
        print(f"Error: {filename} not found")
        return

    print(f"Uploading {filename} to {url}...")
    
    with open(filename, "rb") as f:
        files = {"file": (os.path.basename(filename), f, "text/plain")}
        try:
            response = requests.post(url, files=files)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Success! Created Well: {data.get('well_name')}")
            else:
                print(f"❌ Failed! {response.text}")
        except Exception as e:
            print(f"Connection Error: {e}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "../demo.las"
    # Run twice to test auto-rename
    print("--- FIRST UPLOAD ---")
    test_upload(target)
    print("\n--- SECOND UPLOAD (TESTING AUTO-RENAME) ---")
    test_upload(target)
