import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI(title="Blackcoffer Data API")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.environ.get("MONGO_URI")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

db_collection = None
if MONGO_URI:
    try:
        client = MongoClient(MONGO_URI)
        db_collection = client.blackcoffer.insights
        print("MongoDB client initialized.")
    except Exception as e:
        print(f"Error initializing MongoDB: {e}")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("Gemini API initialized.")
else:
    print("GEMINI_API_KEY not found.")

local_data = []
try:
    with open("../jsondata.json", "r", encoding="utf-8") as f:
        local_data = json.load(f)
except Exception as e:
    pass

@app.get("/api/data")
async def get_data(
    end_year: Optional[str] = None,
    topic: Optional[str] = None,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    pestle: Optional[str] = None,
    source: Optional[str] = None,
    country: Optional[str] = None,
):
    if db_collection is not None:
        try:
            query = {}
            if end_year: query["end_year"] = end_year
            if topic: query["topic"] = topic
            if sector: query["sector"] = sector
            if region: query["region"] = region
            if pestle: query["pestle"] = pestle
            if source: query["source"] = source
            if country: query["country"] = country
            
            cursor = db_collection.find(query, {"_id": 0})
            return list(cursor)
        except Exception as e:
            print(f"Error fetching from MongoDB: {e}")
            
    filtered_data = local_data
    if end_year: filtered_data = [d for d in filtered_data if str(d.get("end_year")) == end_year]
    if topic: filtered_data = [d for d in filtered_data if d.get("topic") == topic]
    if sector: filtered_data = [d for d in filtered_data if d.get("sector") == sector]
    if region: filtered_data = [d for d in filtered_data if d.get("region") == region]
    if pestle: filtered_data = [d for d in filtered_data if d.get("pestle") == pestle]
    if source: filtered_data = [d for d in filtered_data if d.get("source") == source]
    if country: filtered_data = [d for d in filtered_data if d.get("country") == country]
        
    return filtered_data

@app.get("/api/filters")
async def get_filter_options():
    if db_collection is not None:
        try:
            filters = {
                "end_year": db_collection.distinct("end_year"),
                "topic": db_collection.distinct("topic"),
                "sector": db_collection.distinct("sector"),
                "region": db_collection.distinct("region"),
                "pestle": db_collection.distinct("pestle"),
                "source": db_collection.distinct("source"),
                "country": db_collection.distinct("country"),
            }
            # Remove None/empty strings and sort
            for k in filters:
                filters[k] = sorted(list(set([str(x) for x in filters[k] if x])))
            return filters
        except Exception as e:
            print(f"Error fetching filters from MongoDB: {e}")

    filters = {
        "end_year": list(set([str(d.get("end_year")) for d in local_data if d.get("end_year")])),
        "topic": list(set([d.get("topic") for d in local_data if d.get("topic")])),
        "sector": list(set([d.get("sector") for d in local_data if d.get("sector")])),
        "region": list(set([d.get("region") for d in local_data if d.get("region")])),
        "pestle": list(set([d.get("pestle") for d in local_data if d.get("pestle")])),
        "source": list(set([d.get("source") for d in local_data if d.get("source")])),
        "country": list(set([d.get("country") for d in local_data if d.get("country")])),
    }
    for k in filters:
        filters[k].sort()
    return filters

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = ""

@app.post("/api/chat")
async def chat_with_data(request: ChatRequest):
    if not GEMINI_API_KEY:
        return {"response": "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file."}
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        system_prompt = f"""You are 'Chronos', an expert AI Geopolitical Data Analyst. 
The user is viewing a dashboard with the following filters currently applied: {request.context}.
Answer the user's question concisely, professionally, and directly based on general geopolitical knowledge and the context of the filters they have selected. Do not make up specific statistics unless you know them, but you can explain the relevance of their selected filters."""

        response = model.generate_content([
            {"role": "user", "parts": [system_prompt + "\n\nUser Question: " + request.message]}
        ])
        
        return {"response": response.text}
    except Exception as e:
        return {"response": f"Error generating response: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
