import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Please set SUPABASE_URL and SUPABASE_KEY in .env file")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_database():
    try:
        with open("../jsondata.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            
        chunk_size = 100
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i+chunk_size]
            for item in chunk:
                for k, v in item.items():
                    if v == "":
                        item[k] = None
            
            print(f"Inserting chunk {i//chunk_size + 1} of {len(data)//chunk_size + 1}...")
            supabase.table("insights").insert(chunk).execute()
            
        print("Database seeding completed successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_database()
