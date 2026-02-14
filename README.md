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

## 🛠 Architectural Decisions (Justification)

### 1. Database Choice: PostgreSQL

We chose **PostgreSQL** for three primary reasons:

- **Relational Consistency**: Subsurface data requires strict relationships between Wells, Curves, and Header Metadata.
- **JSONB Strategy**: Well logs have irregular schemas (Well A might have Gamma Ray, Well B might not). We store measurements in a specialized `WellData` table using `JSONB` for the curve values, which allows indexable, flexible storage without schema migrations for new curve types.
- **Bulk Performance**: PostgreSQL handles the bulk-insertion of 10,000+ depth rows per LAS file efficiently via SQLAlchemy's mapping interface.

### 2. File Storage Strategy: Hybrid S3 + Local

Every LAS file is treated with "Cloud-First" durability.

- **Amazon S3**: Original files are streamed to S3 for long-term storage and archival.
- **Local Fallback**: For local evaluation/development, the system automatically detects missing AWS credentials and falls back to a local `uploads/` directory, ensuring the app is always functional.

### 3. Visualization: Precision Downsampling

To prevent browser lag with files containing 50,000+ data points:

- **Calculation**: Statistics (Max, Min, StdDev) are calculated on the **Full Dataset** in Python for precision.
- **Rendering**: The chart receives a **Downsampled Stream** (e.g., every 5th point) based on user selection, ensuring a "snappy" 60fps interaction on the frontend while showing the full scientific breadth.

---

## 🔬 AI Grounding (The Technical Edge)

The AI Interpretation engine is not a generic "wrapper." It utilizes a **Grounding-First** approach:

1. **Pre-Analysis**: Python calculates hydrocarbon indicators (Gas Wetness Index, Balance Index) before the LLM sees the data.
2. **Technical Grounding**: The prompt is injected with these hard-numbers. This prevents "AI hallucinations" by forcing the model (Llama-3.3-70b) to reference exact peak values and depths verified by the backend.
3. **Groq Acceleration**: We use Groq's LPUs to deliver complex geological reports in <2 seconds.

---

## ✦ Key Features (Requirements Saturation)

- ✅ **LAS 2.0 Ingestion**: Full parsing of `~WELL`, `~CURVE`, and `~ASCII` blocks.
- ✅ **Interactive Charting**: Zoom and depth-windowing via the **Depth Brush**.
- ✅ **Deep AI Interpretation**: Hydrocarbon potential and formation analysis.
- ✅ **GeoBot (Bonus)**: Technical assistant grounded in real-time well statistics.
- ✅ **Secure Infrastructure**: All API Keys are processed strictly server-side.

---
