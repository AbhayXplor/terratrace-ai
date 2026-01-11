import { NextResponse } from 'next/server';
import ee from '@google/earthengine';
import { initGEE } from '@/lib/gee';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/analyze
 * 
 * This endpoint performs a comprehensive environmental audit of a selected region.
 * It combines Google Earth Engine (GEE) for geospatial analysis with Google Gemini AI
 * for qualitative interpretation.
 * 
 * Workflow:
 * 1. Initialize GEE server-side.
 * 2. Define the Region of Interest (ROI) from user geometry or bounds.
 * 3. Calculate Biomass Loss & Gain using Sentinel-2 satellite imagery (NDVI).
 * 4. Feed the statistical results into Gemini AI to generate a human-readable audit report.
 * 5. Estimate Carbon Credits and assign a Risk Score.
 * 6. Save the audit result to Supabase.
 * 
 * @param {Request} request - JSON body containing { lat, lng, bounds, geometry, year, compareYear, leakage }
 * @returns {NextResponse} - JSON response with the project data or error.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lat, lng, bounds, geometry, leakage } = body;
        const year = body.year;
        const compareYear = body.compareYear;

        // 1. Initialize GEE
        await initGEE();

        // 2. Define Region of Interest
        let roi;
        if (geometry) {
            roi = ee.Geometry.Polygon(geometry.coordinates);
        } else if (bounds) {
            roi = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);
        } else {
            const point = ee.Geometry.Point([lng, lat]);
            roi = point.buffer(5000);
        }

        // --- LEAKAGE ANALYSIS MODE ---
        if (leakage) {
            // Create a 10km buffer ring around the ROI
            // Buffer(10000) minus Buffer(0) effectively, or difference with original
            const buffer = roi.buffer(10000);
            const ring = buffer.difference(roi);

            // Calculate Loss in the Ring
            const getNDVI = (year: string) => {
                return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                    .filterDate(`${year}-01-01`, `${year}-12-31`)
                    .filterBounds(ring)
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                    .median()
                    .normalizedDifference(['B8', 'B4']);
            };

            const ndvi2020 = getNDVI('2020');
            const ndvi2024 = getNDVI('2024');
            const diff = ndvi2020.subtract(ndvi2024);

            const stats = diff.reduceRegion({
                reducer: ee.Reducer.mean(),
                geometry: ring,
                scale: 100, // Coarser scale for speed
                maxPixels: 1e9
            });

            const result = await new Promise((res) => stats.evaluate(res));
            const meanLoss = (result as any)?.nd || 0; // 'nd' is default name for normalized difference if not renamed

            // If meanLoss is positive, it means vegetation decreased
            const leakageScore = Math.max(0, meanLoss * 100).toFixed(2);

            return NextResponse.json({ success: true, leakage_score: leakageScore });
        }

        // 3. Calculate Real Biomass Loss & Gain (User Selected Years)
        const startYear = year || '2020'; // Default if not passed
        const endYear = compareYear || '2024';

        const getNDVI = (year: string) => {
            return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterDate(`${year}-06-01`, `${year}-09-30`) // Peak season
                .filterBounds(roi)
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                .median()
                .normalizedDifference(['B8', 'B4'])
                .rename('NDVI');
        };

        const ndviStart = getNDVI(startYear);
        const ndviEnd = getNDVI(endYear);

        const diff = ndviStart.subtract(ndviEnd); // Positive = Loss (Start > End)
        const gainDiff = ndviEnd.subtract(ndviStart); // Positive = Gain (End > Start)

        // Calculate Loss
        const lossMask = diff.gt(0.15); // Significant loss threshold
        const lossStats = diff.updateMask(lossMask).reduceRegion({
            reducer: ee.Reducer.mean(),
            geometry: roi,
            scale: 30,
            maxPixels: 1e9
        });

        // Calculate Gain
        const gainMask = gainDiff.gt(0.15); // Significant gain threshold
        const gainStats = gainDiff.updateMask(gainMask).reduceRegion({
            reducer: ee.Reducer.mean(),
            geometry: roi,
            scale: 30,
            maxPixels: 1e9
        });

        // Calculate Vegetation Area (Hectares) - using end year to see current state
        const vegMask = ndviEnd.gt(0.2); // Lower threshold to include recovering areas/grasslands
        const areaImage = ee.Image.pixelArea().updateMask(vegMask).clip(roi);
        const areaStats = areaImage.reduceRegion({
            reducer: ee.Reducer.sum(),
            geometry: roi,
            scale: 10,
            maxPixels: 1e9
        });

        const results = await Promise.all([
            new Promise((res) => lossStats.evaluate(res)),
            new Promise((res) => gainStats.evaluate(res)),
            new Promise((res) => areaStats.evaluate(res))
        ]);

        const meanLoss = (results[0] as any)?.NDVI || 0;
        const meanGain = (results[1] as any)?.NDVI || 0;
        const vegAreaSqM = (results[2] as any)?.area || 0;
        const hectares = vegAreaSqM / 10000;

        const lossPercentage = Math.min(100, Math.max(0, meanLoss * 100));
        const gainPercentage = Math.min(100, Math.max(0, meanGain * 100));

        // 4. Gemini AI Analysis
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `
            Analyze this environmental data for a carbon credit audit (${startYear} vs ${endYear}):
            Location: ${lat}, ${lng}
            Region Type: ${geometry ? 'Custom Polygon Selection' : bounds ? 'User Defined Bounding Box' : '5km Radius'}
            Vegetation Area: ${hectares.toFixed(2)} Hectares
            Mean NDVI Loss (Deforestation): ${lossPercentage.toFixed(2)}%
            Mean NDVI Gain (Reforestation/Growth): ${gainPercentage.toFixed(2)}%
            
            Return a JSON object with:
            {
                "location_name": "A short, specific name for this exact area (e.g. 'Amazonas Sector 4', 'Saihanba Forest Reserve'). Be creative but realistic.",
                "is_suitable": true/false,
                "land_cover": "Forest/Grassland/Wetland/etc",
                "risk_score": 0-100,
                "ai_analysis": "2 sentence professional audit summary."
            }
        `;

        const aiRes = await model.generateContent(prompt);
        const aiText = aiRes.response.text().replace(/```json|```/g, "").trim();
        const aiData = JSON.parse(aiText);

        // Defensive check: If AI echoes instructions or returns too long a name
        if (aiData.location_name && aiData.location_name.length > 60) {
            aiData.location_name = "Analyzed Region " + Math.floor(Math.random() * 1000);
        }

        if (!aiData.is_suitable) {
            return NextResponse.json({
                success: false,
                error: `Location is classified as ${aiData.land_cover}. Not suitable for carbon audit.`
            });
        }

        // 5. Calculate Credits & Valuation
        // 1 Ha of tropical forest ~= 150 tCO2e
        const carbonDensity = 150;
        const estimatedCredits = Math.floor(hectares * carbonDensity);

        // Map numeric risk score to string enum for DB
        let riskEnum = 'LOW';
        if (aiData.risk_score > 70) riskEnum = 'HIGH';
        else if (aiData.risk_score > 30) riskEnum = 'MEDIUM';

        const newProject = {
            location_name: aiData.location_name,
            latitude: lat,
            longitude: lng,
            biomass_loss: parseFloat(lossPercentage.toFixed(1)),
            risk_score: riskEnum, // Use the mapped string value
            credits_issued: estimatedCredits,
            ai_analysis: aiData.ai_analysis
        };

        const { data, error } = await supabase.from('projects').insert(newProject).select().single();
        if (error) throw error;

        return NextResponse.json({ success: true, project: data });

    } catch (error: any) {
        console.error('Analyze Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
