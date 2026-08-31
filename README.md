# AI-Powered Calorie Tracker

A local fullstack application that takes a photo of a meal, uses the Cohere API (vision) to identify the food, and returns an estimated calorie count. Meal history is stored locally.

## Features

- Upload/drag-and-drop a meal photo, or capture one with your webcam
- Calorie estimate and food identification via Cohere's vision API
- Local meal history (stored in SQLite)

## Tech Stack

- **Frontend:** React (Vite, TypeScript)
- **Backend:** Python (FastAPI)
- **Database:** SQLite (local)
- **AI:** Cohere API (image/vision) for food identification

## Getting Started

Requires Node.js and Python 3.11+ installed locally, and a [Cohere API key](https://dashboard.cohere.com/api-keys).

**Backend:**
```
cd backend
pip install -r requirements.txt
cp .env.example .env   # then fill in COHERE_API_KEY
uvicorn main:app --reload
```

**Frontend** (in a separate terminal):
```
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (defaults to http://localhost:5173). Both servers need to be running.
