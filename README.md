# 🌍 TerraTrace: AI Planetary Audit System

> **Winner of [Hackathon Name] (Hopefully!)**  
> *Track: Machine Learning / AI*

![TerraTrace Dashboard](https://via.placeholder.com/1200x600/000000/10b981?text=TERRATRACE+DASHBOARD)

## 🚀 The Problem
The Carbon Credit market is a **$2 Billion industry**, but it's plagued by fraud. "Phantom Forests" — projects that claim to protect trees that were never in danger, or worse, have already been cut down — account for up to **90% of offsets** issued by some major registries.

Manual auditing is slow, expensive, and prone to corruption. We need a **trustless, planetary-scale verification system**.

## 💡 The Solution
**TerraTrace** is an autonomous AI auditor that uses satellite imagery to verify environmental claims in real-time.

*   **👀 Satellite Eyes:** Uses **Google Earth Engine** to analyze Sentinel-2 imagery (10m resolution).
*   **🧠 AI Brain:** Uses **Google Gemini 2.5 Flash** to analyze spectral data (NDVI, NIR) and generate professional audit reports.
*   **🕵️‍♂️ Leakage Probe:** Automatically scans a 10km buffer zone around projects to detect "leakage" (displacement of deforestation).
*   **⏳ Time Machine:** Compare historical data (2016-2024) to verify biomass integrity over time.

## 🛠️ Tech Stack
*   **Frontend:** Next.js 14, React, TailwindCSS, Framer Motion
*   **Geospatial Engine:** Google Earth Engine API (Python/REST)
*   **AI Intelligence:** Google Gemini API (Multimodal Analysis)
*   **Database:** Supabase (PostgreSQL)
*   **Maps:** Mapbox GL JS

## ✨ Key Features
1.  **Multi-Spectral Analysis:** Toggle between **True Color**, **False Color (NIR)**, and **NDVI** (Vegetation Health) to see what the human eye misses.
2.  **Instant Audit Certificates:** Generate verifiable PDF-ready certificates for any location on Earth in seconds.
3.  **Biomass Gain/Loss Detection:** Quantify exactly how much forest was lost—or gained—over any time period.
4.  **Risk Scoring:** AI-driven risk assessment (Low/Medium/High) based on land cover and historical trends.

## 📦 How to Run

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/yourusername/terratrace.git
    cd terratrace
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file with:
    ```env
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    GEMINI_API_KEY=your_gemini_key
    GOOGLE_APPLICATION_CREDENTIALS_JSON={"your": "service_account"}
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 🔮 Future Roadmap
*   **Blockchain Verification:** Mint audit certificates as NFTs on Celo/Polygon for immutable proof.
*   **Crowdsourced Ground Truth:** Allow locals to upload geo-tagged photos to verify satellite anomalies.
*   **Predictive Risk Models:** Use LSTM networks to predict *future* deforestation hotspots before they happen.

---

*Built with 💚 for the Planet.*
