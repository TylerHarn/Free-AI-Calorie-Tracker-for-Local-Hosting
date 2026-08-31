# AI-Powered Calorie Tracker

A local fullstack application for tracking calories by photo. Each household member picks their name, does a one-time setup to get a personal daily calorie target for weight loss, then logs meals by photo — the Cohere API (vision) identifies the food and estimates calories, and a progress bar shows how today stacks up against their goal.

## Features

- Simple household sign-in (pick your name, no password)
- Setup calculates a daily calorie goal from your stats (Mifflin-St Jeor BMR, activity level, and target weight-loss rate)
- Upload/drag-and-drop a meal photo, or capture one with your webcam
- Calorie estimate and food identification via Cohere's vision API
- Daily progress bar (calories eaten vs. goal) and local meal history, per person (stored in SQLite)

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
