# Houser

Melbourne property price predictor using machine learning model.

**Live:** [houser-frontend.vercel.app](https://houser-frontend.vercel.app) 
**API:** [housemarketpredictor.onrender.com](https://housemarketpredictor.onrender.com)

## What it does

- Predicts property prices based on rooms, bathrooms, land size, suburb, and property type
- Interactive map showing median prices across Melbourne suburbs
- Suburb statistics with price breakdowns by property type

## Stack

- **Frontend:** React, Vite, Tailwind, React Leaflet
- **Backend:** FastAPI, scikit-learn (Random Forest), pandas

## Run locally

Train model and generate suburb data:
```bash
cd ml
python train_model.py
python generate_suburb_data.py
```

Backend:
```bash
source venv/bin/activate
cd ml-api
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:
```bash
cd frontend/frontend
npm install
npm run dev
```

