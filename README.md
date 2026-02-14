# OneGeo - Well Log Analysis Platform

Professional web-based system for subsurface well-log data ingestion, visualization, and AI-assisted interpretation.

## 🚀 Quick Start (Local Setup)

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (or any SQL DB supported by SQLAlchemy)

### 1. Backend Setup

```bash
cd Backend
pip install -r requirements.txt
```

Create a `.env` file in the `Backend` directory:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/onegeo
ANTHROPIC_API_KEY=your_key_here
# Optional AWS S3 (Fallbacks to local if not provided)
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

Run the server:

```bash
python main.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000
```

Run the development server:

```bash
npm run dev
```

---

## 🛠 Technical Decisions & Justifications

### 1. Database: PostgreSQL

The logic for choosing PostgreSQL is centered on high-availability and data variety:

- **Relational Integrity**: Essential for linking Well metadata consistently with measurement curves.
- **JSONB Support**: Well logs have varying schemes (different curve names for different wells). PostgreSQL's JSONB allows us to store arbitrary curve data key-value pairs while maintaining high performance.
- **Scalability**: Able to handle millions of data points across multiple independent logs.
- **Schema Evolution**: The platform is designed for agility. For example, when adding the Amazon S3 integration, we utilized a "Migration Strategy" to surgically add new slots (like `s3_key`) to existing tables without wiping existing well data. This ensures the system can grow as new engineering features are requested.

### 2. Performance: Backend Downsampling

Sending raw well data (often 10,000 to 50,000+ points) directly to a React frontend causes significant RAM usage and DOM lag.

- **Strategy**: Our API implements an optional `downsample` parameter.
- **Implementation**: The backend calculates statistics on the **full range** for precision but serves only every Nth point to the browser for the chart. This provides a "snappy" UI experience without sacrificing scientific accuracy.

### 3. Storage: S3 with Local Fallback

Original LAS files are binary/text assets.

- **Decision**: Storing them as Blobs in the DB is inefficient. We use **Amazon S3** for primary storage to ensure cloud durability.
- **Fallback**: A custom Storage Wrapper ensures that if AWS credentials are missing, the system gracefully uses local disk storage, allowing for effortless local development.

### 4. AI Interpretation: Statistics-First Prompting

Instead of sending raw curves to the AI (which exceeds context limits), our interpretation engine calculates **descriptive statistics** (Min, Max, Mean, Standard Deviation) for the selected depth range.

- **Result**: The AI acts as a digital petrophysicist, correlating statistical signatures with geological formation properties.

---

## ✦ Key Features

- **LAS 2.0 Ingestion**: Automatic parsing of headers and ASCII data blocks.
- **Interactive Visualization**: Zoom, pan, and curve selection powered by Recharts.
- **AI Interpretation**: Detailed formation analysis using LLMs.
- **GeoBot (Bonus)**: Conversational assistant for instant well metadata queries.

## 👥 Authors

Developed for the One-Geo Engineering Assignment.

- Private Repository Read Access: shilu143, mahesh-248, manish-44, Grudev100, crhodes-dev.
