# Chronos Geopolitical Insights

A data visualization dashboard built for intelligence and risk officers to derive insights from global events.

## Aesthetic Choices & Rationale
**The Brief:** Create a distinctive visual identity that is not AI-templated (e.g., no glowing gradients, no generic warm terracotta, no unnecessary animations).
**The Direction:** "Brutalist Intelligence". 
- **Palette:** Cold, industrial concrete grey (`#E8EAE6`), stark white, heavy obsidian black, punctuated purely by data signals: Ultramarine Blue (`#0B39DB`) for interaction/topic intensity and Vermillion Red (`#E84824`) for risk/likelihood.
- **Typography:** Space Grotesk for display (stark, architectural) combined with JetBrains Mono for data labels and filters (evoking terminal precision).
- **Layout:** Asymmetrical. A dense, technical left sidebar anchoring the filters and the AI analyst, contrasted with a stark, border-heavy right pane where the visualizations do the heavy lifting without any fluff.
- **Charts (D3.js):** Kept flat and precise. The "Bubble Chart" was transformed into a Treemap to maintain the structured, high-density layout instead of playful floating circles.

## Tech Stack
- **Backend:** Python FastAPI
- **Frontend:** Next.js (React), D3.js (Visualizations)
- **Database:** MongoDB
- **AI Integration:** Google Gemini API (for the Geopolitical Chat Analyst)

## Setup Instructions

### 1. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
To connect the database and AI, create a `.env` in the `backend/` folder:
```
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
```
To seed the database with the initial dataset, run:
```bash
python seed.py
```

To run the local API server:
```bash
uvicorn main:app --reload
```
*(Note: If `MONGO_URI` is not provided, the backend will gracefully fall back to reading `jsondata.json` directly).*

### 2. Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000` to interact with the dashboard.

## Deployment Notes
- **Frontend (Vercel):** Ensure `NEXT_PUBLIC_API_URL` is set in your Vercel Environment Variables to point to your live backend URL. 
- **Backend (Railway/Render):** The backend includes a `Dockerfile` for easy containerized deployment. Ensure you add `MONGO_URI` and `GEMINI_API_KEY` to your production environment variables.
