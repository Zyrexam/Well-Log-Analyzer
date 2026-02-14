import requests
res = requests.get("http://localhost:8000/wells")
wells = res.json()["wells"]
for w in wells:
    print(f"- {w['well_name']}")
