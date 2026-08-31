# AI-Powered Calorie Tracker

A local fullstack application for tracking calories by photo, built for use on your phone. Each household member picks their name, does a one-time setup to get a personal daily calorie target for weight loss, then logs meals by photo — the Cohere API (vision) identifies the food and estimates calories, and a plate-ring progress gauge shows how today stacks up against their goal.

## Features

- Simple household sign-in (pick your name, no password)
- Setup calculates a daily calorie goal from your stats (Mifflin-St Jeor BMR, activity level, and target weight-loss rate)
- Log a meal photo with your phone's native camera/library picker
- Calorie estimate and food identification via Cohere's vision API — review and adjust the estimate (or discard it) before it's added to your log
- Edit or delete any logged entry, or add a food manually without a photo
- Log workouts (pick an activity and duration) — calories burned are estimated from a MET-based formula and subtracted from the day's ring
- Daily progress ring (net calories vs. goal) and a receipt-style daily log mixing meals and workouts, per person (stored in SQLite)

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
