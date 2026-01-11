'use client';

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapProps {
    selectedLocation?: number[];
    layers?: {
        satellite: boolean;
        rivers: boolean;
        mining: boolean;
    };
    year?: string;
    compareYear?: string;
    spectralMode?: 'visual' | 'ndvi' | 'false-color';
    onMapClick?: (lng: number, lat: number) => void;
    selectionMode?: boolean;
    onRegionSelect?: (data: any) => void;
}

const Map: React.FC<MapProps> = ({
    selectedLocation,
    layers,
    year = '2020',
    compareYear,
    spectralMode = 'ndvi',
    onMapClick,
    selectionMode = false,
    onRegionSelect
}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [geeStatus, setGeeStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    // Polygon Selection State
    const [polygonPoints, setPolygonPoints] = useState<number[][]>([]);
    const [cursorPos, setCursorPos] = useState<number[] | null>(null);

    // Handle GEE Layers
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        const updateGeeLayers = async () => {
            setGeeStatus('loading');
            try {
                const resBaseline = await fetch(`/api/gee/layer?year=${year}&mode=${spectralMode}`);
                const dataBaseline = await resBaseline.json();

                if (dataBaseline.url && map.current) {
                    if (map.current.getLayer('gee-baseline')) map.current.removeLayer('gee-baseline');
                    if (map.current.getSource('gee-baseline')) map.current.removeSource('gee-baseline');

                    map.current.addSource('gee-baseline', {
                        type: 'raster',
                        tiles: [dataBaseline.url],
                        tileSize: 256,
                    });

                    map.current.addLayer({
                        id: 'gee-baseline',
                        type: 'raster',
                        source: 'gee-baseline',
                        paint: { 'raster-opacity': 1 },
                    });
                }

                if (compareYear) {
                    const resCompare = await fetch(`/api/gee/layer?year=${year}&compareYear=${compareYear}&mode=${spectralMode}`);
                    const dataCompare = await resCompare.json();

                    if (dataCompare.url && map.current) {
                        if (map.current.getLayer('gee-compare')) map.current.removeLayer('gee-compare');
                        if (map.current.getSource('gee-compare')) map.current.removeSource('gee-compare');

                        map.current.addSource('gee-compare', {
                            type: 'raster',
                            tiles: [dataCompare.url],
                            tileSize: 256,
                        });

                        map.current.addLayer({
                            id: 'gee-compare',
                            type: 'raster',
                            source: 'gee-compare',
                            paint: { 'raster-opacity': 1 },
                        });
                    }
                } else {
                    if (map.current?.getLayer('gee-compare')) map.current.removeLayer('gee-compare');
                    if (map.current?.getSource('gee-compare')) map.current.removeSource('gee-compare');
                }

                setGeeStatus('ready');
            } catch (error) {
                console.error('Failed to load GEE layers:', error);
                setGeeStatus('error');
            }
        };

        updateGeeLayers();
    }, [year, compareYear, spectralMode]);

    // Handle Fly To
    useEffect(() => {
        if (map.current && selectedLocation) {
            map.current.flyTo({
                center: selectedLocation as [number, number],
                zoom: 13,
                pitch: 60,
                bearing: -10,
                speed: 1.2,
                essential: true
            });
        }
    }, [selectedLocation]);

    // Refs to keep track of latest props without re-binding events
    const selectionModeRef = useRef(selectionMode);
    const onRegionSelectRef = useRef(onRegionSelect);
    const onMapClickRef = useRef(onMapClick);

    useEffect(() => {
        selectionModeRef.current = selectionMode;
        onRegionSelectRef.current = onRegionSelect;
        onMapClickRef.current = onMapClick;
    }, [selectionMode, onRegionSelect, onMapClick]);

    // Initialize Map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                center: [0, 0],
                zoom: 1.5,
                pitch: 0,
                projection: 'globe',
                attributionControl: false,
                interactive: true,
                doubleClickZoom: false // Disable default double click zoom
            });

            map.current.on('click', (e) => {
                if (selectionModeRef.current) {
                    // Add point to polygon
                    const newPoint = [e.lngLat.lng, e.lngLat.lat];
                    setPolygonPoints(prev => [...prev, newPoint]);
                } else if (onMapClickRef.current) {
                    onMapClickRef.current(e.lngLat.lng, e.lngLat.lat);
                }
            });

            map.current.on('mousemove', (e) => {
                if (selectionModeRef.current) {
                    setCursorPos([e.lngLat.lng, e.lngLat.lat]);
                }
            });

            // Removed dblclick handler to prevent accidental extra points. 
            // Users should use the "FINISH" button or click the first point (implemented below).

            // Allow closing by clicking the first point
            map.current.on('click', 'drawing-points', (e) => {
                if (!selectionModeRef.current) return;
                const features = map.current?.queryRenderedFeatures(e.point, { layers: ['drawing-points'] });
                if (features && features.length > 0) {
                    // If we clicked an existing point, and it's the first one, close the polygon
                    // We need to check if it is indeed the first point.
                    // Since we can't easily identify the index from the feature here without properties,
                    // we'll stick to the "FINISH" button for absolute clarity and robustness.
                    // Or we can just rely on the FINISH button which is already implemented and very clear.
                }
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

            map.current.on('style.load', () => {
                map.current?.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });
                map.current?.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
                map.current?.setFog({
                    'range': [0.5, 10],
                    'color': '#000000',
                    'high-color': '#000000',
                    'space-color': '#000000',
                    'star-intensity': 0.35
                });

                // Add source/layers for polygon drawing
                map.current?.addSource('drawing-source', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    }
                });

                map.current?.addLayer({
                    id: 'drawing-line',
                    type: 'line',
                    source: 'drawing-source',
                    paint: {
                        'line-color': '#00ffcc', // Bright Cyan/Turquoise for high contrast
                        'line-width': 4, // Thicker line
                        'line-dasharray': [2, 1]
                    }
                });

                map.current?.addLayer({
                    id: 'drawing-points',
                    type: 'circle',
                    source: 'drawing-source',
                    paint: {
                        'circle-radius': 6, // Larger points
                        'circle-color': '#ffffff',
                        'circle-stroke-color': '#00ffcc',
                        'circle-stroke-width': 3
                    }
                });
                map.current?.addLayer({
                    id: 'drawing-fill',
                    type: 'fill',
                    source: 'drawing-source',
                    paint: {
                        'fill-color': '#00ffcc',
                        'fill-opacity': 0.2 // Slightly more opaque
                    }
                });
            });

        } catch (err: any) {
            setMapError(`Initialization Error: ${err.message}`);
        }

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Update Drawing Source
    useEffect(() => {
        if (!map.current || !map.current.getSource('drawing-source')) return;

        const source = map.current.getSource('drawing-source') as mapboxgl.GeoJSONSource;

        const features: any[] = [];

        if (polygonPoints.length > 0) {
            // Points
            polygonPoints.forEach(p => {
                features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: p }
                });
            });

            // Lines
            const lineCoords = [...polygonPoints];
            if (cursorPos && selectionMode) {
                lineCoords.push(cursorPos);
            }
            // If we have at least 2 points (including cursor), draw line
            if (lineCoords.length >= 2) {
                features.push({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: lineCoords }
                });
            }
            // Fill (preview)
            if (polygonPoints.length >= 3) {
                features.push({
                    type: 'Feature',
                    geometry: { type: 'Polygon', coordinates: [[...polygonPoints, polygonPoints[0]]] }
                });
            }
        }

        source.setData({
            type: 'FeatureCollection',
            features: features
        });

    }, [polygonPoints, cursorPos, selectionMode]);


    // Selection Mode Logic (Cursor)
    useEffect(() => {
        if (!map.current) return;
        try {
            const canvas = map.current.getCanvas();
            if (selectionMode) {
                // Do NOT disable dragPan, it breaks rotation/navigation
                // map.current.dragPan.disable(); 
                if (canvas) canvas.style.cursor = 'crosshair';
            } else {
                map.current.dragPan.enable();
                if (canvas) canvas.style.cursor = '';
                setPolygonPoints([]); // Reset on exit
            }
        } catch (e) {
            console.warn('Map canvas not ready for cursor update');
        }
    }, [selectionMode]);


    return (
        <div className="relative w-full h-full bg-zinc-950">
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* Instructions Overlay */}
            {selectionMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur border border-emerald-500/50 px-4 py-2 rounded-full pointer-events-auto">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                            {polygonPoints.length === 0 ? "Click to start drawing" : "Click to add point • Click FINISH when done"}
                        </p>
                    </div>
                    {polygonPoints.length >= 3 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Trigger completion manually
                                // Convert to GeoJSON Polygon
                                const polygon: any = {
                                    type: 'Polygon',
                                    coordinates: [[...polygonPoints, polygonPoints[0]]]
                                };
                                const bounds = new mapboxgl.LngLatBounds();
                                polygonPoints.forEach(p => bounds.extend(p as [number, number]));
                                if (onRegionSelect) {
                                    onRegionSelect({ geometry: polygon, bounds });
                                }
                                setPolygonPoints([]);
                            }}
                            className="bg-emerald-500 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)] pointer-events-auto"
                        >
                            FINISH
                        </button>
                    )}
                </div>
            )}

            {compareYear && (
                <div className="absolute bottom-8 left-4 z-10 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Change Detection</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            <span className="text-xs font-bold text-zinc-200">Biomass Loss (Deforestation)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            <span className="text-xs font-bold text-zinc-200">Biomass Gain (Afforestation)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Map;
