## TerraTrace

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
    Create a `.env.local` file in the root directory. You will need API keys for Mapbox, Supabase, Google Gemini, and a Google Cloud Service Account for Earth Engine.
    
    ```env
    # Mapbox (Visualization)
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here

    # Supabase (Database)
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

    # Google Gemini (AI Analysis)
    GEMINI_API_KEY=your_gemini_key_here

    # Google Earth Engine (Geospatial Processing)
    # Note: You must enable the GEE API in Google Cloud Console
    GEE_SERVICE_ACCOUNT=your-service-account@project.iam.gserviceaccount.com
    GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🏗️ Architecture
*   `/src/app/api/analyze`: The core logic. Handles GEE initialization, biomass calculation, and Gemini AI prompting.
*   `/src/app/api/gee/layer`: Generates dynamic map tiles (NDVI, False Color) using GEE's `getMapId`.
*   `/src/components/Map.tsx`: The main visualization component using Mapbox GL JS.
*   `/src/lib/gee.ts`: Server-side singleton for Google Earth Engine authentication.

## 🔮 Future Roadmap
*   **Blockchain Verification:** Mint audit certificates as NFTs on Celo/Polygon for immutable proof.
*   **Crowdsourced Ground Truth:** Allow locals to upload geo-tagged photos to verify satellite anomalies.
*   **Predictive Risk Models:** Use LSTM networks to predict *future* deforestation hotspots before they happen.

---

*Built with 💚 for the Planet.*
