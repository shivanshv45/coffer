import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")

if not MONGO_URI:
    print("Please set MONGO_URI in .env file")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.blackcoffer
collection = db.insights

def seed_database():
    try:
        with open("../jsondata.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            
        for item in data:
            for k, v in item.items():
                if v == "":
                    item[k] = None
        
        # Clear existing data just in case
        collection.delete_many({})
        print("Existing data cleared.")
        
        print(f"Inserting {len(data)} documents into MongoDB...")
        collection.insert_many(data)
            
        print("Database seeding completed successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_database()
