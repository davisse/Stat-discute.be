import json

def print_keys(data, indent=0):
    if isinstance(data, dict):
        for key, value in data.items():
            print("  " * indent + f"Key: {key}, Type: {type(value)}")
            print_keys(value, indent + 1)
    elif isinstance(data, list):
        for item in data:
            print_keys(item, indent + 1)

with open("/Users/chapirou/dev/perso/stat-discute.be/4.BETTING/all_markets.json", "r") as f:
    data = json.load(f)

print_keys(data)
