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
- **Database:** Supabase (A python seed script is provided, with graceful fallback to local JSON for instant development preview).

## Setup Instructions

### 1. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
To run the database seeding script, create a `.env` in the `backend/` folder:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```
Then run `python seed.py`.

To run the API server:
```bash
uvicorn main:app --reload
```
(Note: The backend gracefully falls back to reading `jsondata.json` directly if Supabase credentials are not provided.)

### 2. Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the dashboard.
