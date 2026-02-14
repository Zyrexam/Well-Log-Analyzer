# OneGeo - Well Log Analysis Platform

**OneGeo** is an engineering-grade subsurface data platform designed to ingest, visualize, and interpret LAS (Log ASCII Standard) data. Built for high performance and data-grounded AI insights.

## 🚀 Submission Checklist & How to Run

### Prerequisites

- **Python 3.10+** (Backend: FastAPI)
- **Node.js 18+** (Frontend: React)
- **PostgreSQL** (Database)
- **Groq API Key** (For ultra-fast Llama-3.3-70b interpretations)

### 1. Backend Setup

```bash
cd Backend
pip install -r requirements.txt
# Create .env based on .env.example
python main.py
```

_The server will start at `http://localhost:8000`._

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

_The platform will be accessible at `http://localhost:5173`._

---

## 🛠 Technical Decisions (Simply Explained)

### 1. Why PostgreSQL?

We chose PostgreSQL because it is reliable and handles scientific data perfectly:

- **Organized**: It keeps wells, charts, and history neatly linked together.
- **Flexible**: Every well has different curve names (like Gamma Ray or Gas). We use a "JSON" feature to store these without breaking the database.
- **Fast**: It can save over 10,000 lines of data in just a few seconds.

### 2. Smart File Storage (S3 + Local)

- **Amazon S3**: Files are saved safely in the cloud so they are never lost.
- **Local Fallback**: If you don't have AWS setup, the app automatically saves files to a local folder so it still works perfectly for you.

### 3. Smooth Charts (No Lag)

Reading 50,000+ data points makes most websites slow. We solved this by:

- **Accurate Math**: Python calculates the "peaks" and "averages" on the full data so nothing is missed.
- **Fast Viewing**: We only send a smaller "sample" of the points to your screen. This makes the charts feel super smooth while still showing the correct trends.

---

## 🌐 Cloud Deployment (Optional)

If you choose to deploy your One-Geo platform to the cloud, here is your roadmap:

### 1. Database (PostgreSQL)

- **Local**: You are currently using localhost.
- **Cloud**: Use **AWS RDS**, **Supabase**, or **Railway**. Update your `DATABASE_URL` in the environment settings.

### 2. Backend (FastAPI)

- **Hosting**: Use **Render**, **Railway**, or **AWS App Runner**.
- **Requirement**: Set all `.env` variables in your provider's "Environment Variables" dashboard.
- **Command**: Use `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`.

### 3. Frontend (React)

- **Hosting**: Use **Vercel**, **Netlify**, or **AWS Amplify**.
- **Config**: Ensure `VITE_API_URL` points to your deployed Backend URL.

### 4. Storage (S3)

- **The Best Part**: Since you already configured S3, your files will stay in the SAME cloud bucket whether you run the app locally or in production!

---

## 🔬 AI Analysis (Data-Grounded)

Our AI doesn't just "guess"—it uses actual math to stay accurate:

1. **Fact-Checking**: Before the AI speaks, our system calculates real engineering ratios (like Gas Wetness).
2. **Hard Evidence**: We give these exact numbers to the AI. This stops it from making things up ("hallucinating") and forces it to use the real spikes in your data.
3. **Instant Reports**: Powered by Groq, your geological reports are ready in under 2 seconds.

---

## ✦ Key Features (Requirements Saturation)

- ✅ **LAS 2.0 Ingestion**: Full parsing of `~WELL`, `~CURVE`, and `~ASCII` blocks.
- ✅ **Interactive Charting**: Zoom and depth-windowing via the **Depth Brush**.
- ✅ **Deep AI Interpretation**: Hydrocarbon potential and formation analysis.
- ✅ **GeoBot (Bonus)**: Technical assistant grounded in real-time well statistics.
- ✅ **Secure Infrastructure**: All API Keys are processed strictly server-side.

---
