import { NextResponse } from 'next/server';
import ee from '@google/earthengine';
import { initGEE } from '@/lib/gee';

export async function GET(request: Request) {
    try {
        await initGEE();

        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year') || '2020';
        const compareYear = searchParams.get('compareYear');
        const mode = searchParams.get('mode') || 'ndvi'; // 'visual' | 'ndvi' | 'false-color'

        // Optimization: Use a simpler collection or pre-filtered assets if possible.
        // For now, we'll stick to Sentinel-2 but optimize the filter.
        const getAnnualComposite = (y: string) => {
            return ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterDate(`${y}-06-01`, `${y}-09-30`) // Focus on peak vegetation season (Northern Hemisphere) - faster than full year
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10)) // Stricter cloud filter
                .median();
        };

        const image1 = getAnnualComposite(year);
        let finalImage;
        let visParams;

        if (compareYear) {
            // --- CHANGE DETECTION MODE ---
            const image2 = getAnnualComposite(compareYear);
            const ndvi1 = image1.normalizedDifference(['B8', 'B4']); // Current
            const ndvi2 = image2.normalizedDifference(['B8', 'B4']); // Old

            // Calculate Loss: Old (ndvi2) - Current (ndvi1)
            // Positive value means vegetation was lost
            const diff = ndvi2.subtract(ndvi1);
            const lossMask = diff.gt(0.15); // Threshold for significant loss
            finalImage = diff.updateMask(lossMask);
            visParams = { min: 0.15, max: 0.5, palette: ['ff0000'] };
        } else {
            // --- SPECTRAL MODES ---
            switch (mode) {
                case 'visual':
                    // True Color (B4, B3, B2) - Adjusted min/max for better brightness
                    finalImage = image1.select(['B4', 'B3', 'B2']);
                    visParams = { min: 0, max: 2500, gamma: 1.2 };
                    break;
                case 'false-color':
                    // NIR False Color (B8, B4, B3) - Vegetation = Red
                    finalImage = image1.select(['B8', 'B4', 'B3']);
                    visParams = { min: 0, max: 3000, gamma: 1.1 };
                    break;
                case 'ndvi':
                default:
                    // NDVI - Improved Palette for clearer distinction
                    const ndvi = image1.normalizedDifference(['B8', 'B4']);
                    finalImage = ndvi.updateMask(ndvi.gt(0.1)); // Mask water/barren
                    visParams = {
                        min: 0,
                        max: 0.8,
                        // Blue/White (Low) -> Green (High)
                        palette: ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901', '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01'],
                    };
                    break;
            }
        }

        const mapId = await new Promise<any>((resolve, reject) => {
            finalImage.getMapId(visParams, (result: any, error: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return NextResponse.json({ url: mapId.urlFormat });
    } catch (error: any) {
        console.error('GEE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
