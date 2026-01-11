'use client';

import React, { useState, useEffect } from 'react';
import Map from "@/components/Map";
import {
  LayoutDashboard,
  Map as MapIcon,
  FileText,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  TreeDeciduous,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Globe,
  Activity,
  X,
  Maximize,
  BarChart3,
  Terminal,
  Download,
  Printer,
  Search,
  Loader2,
  Clock,
  Settings,
  Filter,
  MapPin,
  Scan,
  Database,
  Play
} from "lucide-react";
import BootSequence from "@/components/BootSequence";
import TargetLock from "@/components/TargetLock";
import DataTicker from "@/components/DataTicker";
import SystemLog from "@/components/SystemLog";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [activeView, setActiveView] = useState<'overview' | 'registry' | 'audit'>('overview');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [year, setYear] = useState('2020');
  const [compareYear, setCompareYear] = useState<string | undefined>(undefined);
  const [spectralMode, setSpectralMode] = useState<'visual' | 'ndvi' | 'false-color'>('ndvi');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [bootComplete, setBootComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [viewLocation, setViewLocation] = useState<[number, number] | undefined>(undefined);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pendingBounds, setPendingBounds] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&types=place,region,country,locality`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        // Just fly to location, do NOT analyze yet
        setSelectedProject(null); // Clear selection
        setViewLocation([lng, lat]);
        setSearchQuery("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Financial Stats
  const marketPrice = 18.50;
  const totalCredits = projects.reduce((acc, p) => acc + (p.credits_issued || 0), 0);
  const totalValue = totalCredits * marketPrice;
  const highRiskCount = projects.filter(p => p.risk_score === 'HIGH').length;
  const avgBiomassLoss = projects.length > 0
    ? (projects.reduce((acc, p) => acc + p.biomass_loss, 0) / projects.length).toFixed(1)
    : "0.0";

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('risk_score', { ascending: false });
      if (data) {
        setProjects(data);
        // Do NOT auto-select the first project. Let the user start with the globe view.
        // if (!selectedProject && data.length > 0) setSelectedProject(data[0]);
      }
    };
    fetchProjects();
  }, []);

  const handleGenerateAudit = async () => {
    if (!selectedProject) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: selectedProject.location_name,
          risk_score: selectedProject.risk_score,
          biomass_loss: selectedProject.biomass_loss,
          coordinates: { lat: selectedProject.latitude, lng: selectedProject.longitude },
          year: compareYear || year
        })
      });
      const data = await res.json();
      setReport(data.report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-black text-white font-mono overflow-hidden selection:bg-emerald-500/30">
      <AnimatePresence>
        {!bootComplete && <BootSequence onComplete={() => setBootComplete(true)} />}
      </AnimatePresence>

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="absolute inset-0 grid grid-cols-[80px_1fr_320px] grid-rows-[60px_1fr_180px_32px] z-10 pointer-events-none">

        {/* TOP BAR: BRANDING & SEARCH */}
        <header className="col-span-3 border-b border-emerald-500/20 bg-black/60 backdrop-blur-xl flex items-center justify-between px-6 pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <TreeDeciduous className="text-black w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter leading-none">TERRATRACE</h1>
              <p className="text-[8px] text-emerald-500 font-bold tracking-[0.2em]">PLANETARY AUDIT v2.4</p>
            </div>
          </div>

          {/* SEARCH IN TOP BAR */}
          <div className="w-96 flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative group flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH COORDINATES / LOCATION..."
                className="w-full bg-zinc-900/50 border border-emerald-500/20 rounded py-1.5 pl-10 pr-4 text-[10px] font-bold text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
              {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-500 animate-spin" />}
            </form>

            <div className="flex gap-1">
              <button
                onClick={() => {
                  setViewLocation([-61.9167, -10.0833]); // Rondonia
                  setYear('2024');
                  setCompareYear('2016');
                  window.dispatchEvent(new CustomEvent('system-log', { detail: { message: 'DEMO: LOADING RONDONIA (DEFORESTATION)...', type: 'warning' } }));
                }}
                className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black rounded hover:bg-red-500/20 transition-colors"
              >
                DEMO:LOSS
              </button>
              <button
                onClick={() => {
                  setViewLocation([117.2744, 42.4817]); // Saihanba
                  setYear('2024');
                  setCompareYear('2016');
                  window.dispatchEvent(new CustomEvent('system-log', { detail: { message: 'DEMO: LOADING SAIHANBA (REFORESTATION)...', type: 'success' } }));
                }}
                className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black rounded hover:bg-emerald-500/20 transition-colors"
              >
                DEMO:GAIN
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">MARKET_PRICE</span>
              <span className="text-xs font-black text-emerald-400">$18.50/T</span>
            </div>
            <div className="w-px h-6 bg-emerald-500/20" />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">SYSTEM_ONLINE</span>
            </div>
          </div>
        </header>

        {/* LEFT SIDEBAR: NAVIGATION */}
        <nav className={clsx(
          "row-start-2 border-r border-emerald-500/20 bg-black/40 backdrop-blur-xl flex flex-col items-center py-8 gap-6 pointer-events-auto transition-opacity z-50",
          isDrawing && "opacity-20 pointer-events-none"
        )}>
          <NavButton active={activeView === 'overview'} onClick={() => setActiveView('overview')} icon={LayoutDashboard} label="OVERVIEW" />
          <NavButton active={activeView === 'registry'} onClick={() => setActiveView('registry')} icon={FileText} label="REGISTRY" />
          <NavButton active={activeView === 'audit'} onClick={() => setActiveView('audit')} icon={ShieldCheck} label="AUDIT" />
          <div className="mt-auto flex flex-col gap-4">
            <button
              onClick={() => setIsDrawing(!isDrawing)}
              className={clsx(
                "group relative w-12 h-12 rounded border flex items-center justify-center transition-all hover:scale-105",
                isDrawing ? "bg-emerald-500 border-emerald-400 text-black" : "bg-zinc-900 border-emerald-500/20 text-zinc-500 hover:text-white"
              )}
            >
              <Maximize className="w-5 h-5" />
              <span className={clsx(
                "absolute left-16 px-2 py-1 rounded bg-black border border-white/20 text-[8px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 -translate-x-2 transition-all duration-300 pointer-events-none text-white z-[60]",
                "group-hover:opacity-100 group-hover:translate-x-0"
              )}>
                DRAW_REGION_POLYGON
              </span>
            </button>

            <div className="flex flex-col gap-2 mt-4">
              {[
                { id: 'visual', label: 'VIS', tooltip: 'VISUAL_SPECTRUM (TRUE_COLOR_IMAGERY)' },
                { id: 'ndvi', label: 'NDVI', tooltip: 'VEGETATION_INDEX (PLANT_HEALTH_MONITOR)' },
                { id: 'false-color', label: 'NIR', tooltip: 'NEAR_INFRARED (BIOMASS_&_LOSS_DETECTION)' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSpectralMode(mode.id as any)}
                  className={clsx(
                    "group relative w-12 h-12 rounded border flex items-center justify-center transition-all text-[10px] font-bold hover:scale-105",
                    spectralMode === mode.id
                      ? "bg-emerald-500 border-emerald-400 text-black"
                      : "bg-zinc-900 border-emerald-500/20 text-zinc-500 hover:text-white"
                  )}
                >
                  {mode.label}
                  <span className={clsx(
                    "absolute left-16 px-2 py-1 rounded bg-black border border-white/20 text-[8px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 -translate-x-2 transition-all duration-300 pointer-events-none text-white z-[60]",
                    "group-hover:opacity-100 group-hover:translate-x-0"
                  )}>
                    {mode.tooltip}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* MAIN CONTENT AREA (MAP) */}
        <main className="relative row-start-2 col-start-2 pointer-events-auto overflow-hidden">
          <Map
            selectedLocation={viewLocation || (selectedProject ? [selectedProject.longitude, selectedProject.latitude] : undefined)}
            year={year}
            compareYear={compareYear}
            spectralMode={spectralMode}
            selectionMode={isDrawing}
            onRegionSelect={(data) => {
              setIsDrawing(false);
              setPendingBounds(data);
              window.dispatchEvent(new CustomEvent('system-log', { detail: { message: 'POLYGON CAPTURED: AWAITING CONFIRMATION...', type: 'info' } }));
            }}
          />
          {selectedProject && activeView === 'audit' && <TargetLock />}

          {/* VIEW-SPECIFIC OVERLAYS */}
          <AnimatePresence mode="wait">
            {activeView === 'registry' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-4 bg-black/80 backdrop-blur-2xl border border-emerald-500/20 rounded p-8 overflow-hidden flex flex-col z-20"
              >
                <div className="flex justify-between items-end mb-6 border-b border-emerald-500/20 pb-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tighter">PROJECT_REGISTRY</h2>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">VERIFIED_LEDGER_DATA</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-zinc-900 border border-emerald-500/20 text-[9px] font-bold hover:bg-emerald-500/10 transition-colors">EXPORT_CSV</button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20">
                  <table className="w-full text-left">
                    <thead className="text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-emerald-500/10">
                      <tr>
                        <th className="pb-2">PROJECT</th>
                        <th className="pb-2">COORDS</th>
                        <th className="pb-2">RISK</th>
                        <th className="pb-2 text-right">CREDITS</th>
                        <th className="pb-2 text-right">VALUE</th>
                        <th className="pb-2"></th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px]">
                      {projects.map((p) => (
                        <tr key={p.id} className="group hover:bg-emerald-500/5 border-b border-emerald-500/5 transition-colors">
                          <td className="py-3 font-bold text-emerald-400">{p.location_name}</td>
                          <td className="py-3 text-zinc-500">{p.latitude.toFixed(2)}, {p.longitude.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={clsx("px-1.5 py-0.5 rounded text-[8px] font-black border",
                              p.risk_score === 'HIGH' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            )}>{p.risk_score}</span>
                          </td>
                          <td className="py-3 text-right text-zinc-300">{(p.credits_issued || 0).toLocaleString()}</td>
                          <td className="py-3 text-right text-emerald-400">${((p.credits_issued || 0) * marketPrice).toLocaleString()}</td>
                          <td className="py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle delete
                                if (confirm('Are you sure you want to delete this audit?')) {
                                  fetch('/api/project/delete', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: p.id })
                                  }).then(() => {
                                    setProjects(prev => prev.filter(proj => proj.id !== p.id));
                                    if (selectedProject?.id === p.id) setSelectedProject(null);
                                  });
                                }
                              }}
                              className="p-1 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <button onClick={() => { setSelectedProject(p); setActiveView('audit'); }} className="p-1 hover:text-emerald-400"><ChevronRight className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* RIGHT SIDEBAR: CONTEXTUAL DATA */}
        <aside className={clsx(
          "row-start-2 border-l border-emerald-500/20 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-6 pointer-events-auto transition-opacity z-50",
          isDrawing && "opacity-20 pointer-events-none"
        )}>
          {activeView === 'overview' && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">CRITICAL_ALERTS</span>
                <div className="flex-1 overflow-y-auto space-y-2 mt-2">
                  {projects.filter(p => p.risk_score === 'HIGH').map(p => (
                    <div key={p.id} className="p-3 bg-red-500/5 border border-red-500/20 rounded cursor-pointer hover:bg-red-500/10 transition-all" onClick={() => { setSelectedProject(p); setActiveView('audit'); }}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-white">{p.location_name}</span>
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${p.biomass_loss}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto space-y-4">
                <StatWidget label="TOTAL_PROJECTS" value={projects.length.toString()} />
                <StatWidget label="AVG_LOSS" value={`${avgBiomassLoss}%`} color="text-red-400" />
              </div>
            </>
          )}

          {activeView === 'audit' && selectedProject && (
            <div className="flex flex-col h-full gap-6">
              <div>
                <h2 className="text-lg font-black tracking-tighter text-emerald-400 uppercase">{selectedProject.location_name}</h2>
                <p className="text-[9px] text-zinc-500 mt-1">ID: VT-{String(selectedProject.id).slice(0, 8)}</p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-zinc-900/50 border border-emerald-500/20 rounded">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase block mb-2">BIOMASS_INTEGRITY</span>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-white">{100 - selectedProject.biomass_loss}%</span>
                    <span className="text-[10px] text-emerald-500 font-bold">VERIFIED</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-900/50 border border-emerald-500/20 rounded">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase block mb-2">AI_AUDIT_SUMMARY</span>
                  <p className="text-[10px] text-zinc-400 leading-relaxed italic">"{selectedProject.ai_analysis.replace(/\*\*/g, '')}"</p>
                </div>
              </div>

              <div className="mt-auto space-y-2">
                <button
                  onClick={async () => {
                    setIsGenerating(true);
                    window.dispatchEvent(new CustomEvent('system-log', { detail: { message: 'INITIATING LEAKAGE DETECTION (10KM BUFFER)...', type: 'warning' } }));
                    try {
                      const res = await fetch('/api/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          geometry: selectedProject.geometry || { type: 'Point', coordinates: [selectedProject.longitude, selectedProject.latitude] },
                          lat: selectedProject.latitude,
                          lng: selectedProject.longitude,
                          leakage: true // Flag for leakage analysis
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        window.dispatchEvent(new CustomEvent('system-log', { detail: { message: `LEAKAGE ANALYSIS COMPLETE: ${data.leakage_score}% DISPLACEMENT`, type: 'success' } }));
                        // Ideally update project state here with leakage data
                      }
                    } catch (e) {
                      window.dispatchEvent(new CustomEvent('system-log', { detail: { message: 'LEAKAGE ANALYSIS FAILED', type: 'error' } }));
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={isGenerating}
                  className="w-full py-3 bg-zinc-900 border border-emerald-500/20 text-emerald-500 font-black text-[10px] rounded hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                  RUN_LEAKAGE_PROBE
                </button>

                <button
                  onClick={handleGenerateAudit}
                  disabled={isGenerating}
                  className="w-full py-3 bg-emerald-500 text-black font-black text-[10px] rounded hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  GENERATE_CERTIFICATE
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* BOTTOM BAR: TERMINAL & CONTROLS */}
        <footer className="col-span-3 row-start-3 border-t border-emerald-500/20 bg-black/80 backdrop-blur-2xl grid grid-cols-[320px_1fr_320px] pointer-events-auto">

          {/* SYSTEM LOG COMPONENT */}
          <div className="border-r border-emerald-500/20 overflow-hidden">
            <SystemLog />
          </div>

          {/* CENTRAL TERMINAL: SELECTION & ANALYSIS */}
          <div className="flex items-center justify-center px-12 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {pendingBounds ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-8 w-full justify-center"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] text-emerald-500 font-bold uppercase mb-0.5">POLYGON_SELECTION</span>
                    <span className="text-[10px] font-mono text-white">VERTICES: {pendingBounds.geometry.coordinates[0].length}</span>
                    <span className="text-[10px] font-mono text-white">AREA: CALCULATING...</span>
                  </div>
                  <div className="w-px h-8 bg-emerald-500/20" />
                  <div className="flex gap-3">
                    <button onClick={() => setPendingBounds(null)} className="px-4 py-1.5 border border-emerald-500/20 text-[9px] font-bold hover:bg-white/5 transition-colors">ABORT</button>
                    <button
                      onClick={async () => {
                        setIsAnalyzing(true);
                        const selection = pendingBounds;
                        setPendingBounds(null);
                        window.dispatchEvent(new CustomEvent('system-log', { detail: { message: 'INITIATING POLYGON AUDIT...', type: 'warning' } }));
                        try {
                          const res = await fetch('/api/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              geometry: selection.geometry,
                              lat: selection.bounds.getCenter().lat,
                              lng: selection.bounds.getCenter().lng,
                              year: compareYear || '2016', // Use compare year as start if set, else default start
                              compareYear: year || '2024' // Use current slider year as end
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setProjects(prev => [data.project, ...prev]);
                            setSelectedProject(data.project);
                            setActiveView('audit');
                            window.dispatchEvent(new CustomEvent('system-log', { detail: { message: `AUDIT COMPLETE: ${data.project.location_name}`, type: 'success' } }));
                          } else {
                            window.dispatchEvent(new CustomEvent('system-log', { detail: { message: `ERROR: ${data.error}`, type: 'error' } }));
                          }
                        } catch (e) {
                          window.dispatchEvent(new CustomEvent('system-log', { detail: { message: 'SYSTEM FAILURE DURING ANALYSIS', type: 'error' } }));
                        } finally {
                          setIsAnalyzing(false);
                        }
                      }}
                      className="px-6 py-1.5 bg-emerald-500 text-black font-black text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-colors"
                    >
                      EXECUTE_AUDIT
                    </button>
                  </div>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div key="analyzing" className="flex items-center gap-3 text-emerald-500 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-black tracking-[0.2em]">ANALYZING_SECTOR_DATA...</span>
                </motion.div>
              ) : (
                <motion.div key="idle" className="text-[9px] text-zinc-600 font-bold tracking-[0.3em] uppercase opacity-50">
                  WAITING_FOR_INPUT_COMMAND
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MAP CONTROLS (YEAR SLIDER) */}
          <div className="border-l border-emerald-500/20 flex items-center justify-center gap-6 px-8 w-full">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Time Machine</span>
                <span className="text-lg font-black text-emerald-500 font-mono">{year}</span>
              </div>
              <div className="relative flex items-center h-4">
                <input
                  type="range"
                  min="2016"
                  max="2026"
                  step="1"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(16,185,129,0.5)] hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                />
                <div className="absolute -bottom-4 left-0 text-[8px] font-bold text-zinc-600">2016</div>
                <div className="absolute -bottom-4 right-0 text-[8px] font-bold text-zinc-600">2026</div>
              </div>
            </div>

            <div className="h-8 w-px bg-emerald-500/20" />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareYear(compareYear ? undefined : '2016')}
                className={clsx(
                  "group relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all w-16 hover:scale-105",
                  compareYear
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-transparent border-zinc-800 text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-500"
                )}
              >
                <Activity className="w-4 h-4" />
                <span className="text-[8px] font-bold uppercase">Compare</span>
                <span className={clsx(
                  "absolute bottom-full mb-2 px-2 py-1 rounded bg-black border border-white/20 text-[8px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 translate-y-2 transition-all duration-300 pointer-events-none text-white z-[60]",
                  "group-hover:opacity-100 group-hover:translate-y-0"
                )}>
                  TOGGLE_CHANGE_DETECTION
                </span>
              </button>

              {compareYear && (
                <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-left-4 duration-300">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">BASELINE</span>
                  <select
                    value={compareYear}
                    onChange={(e) => setCompareYear(e.target.value)}
                    className="bg-zinc-900 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold rounded px-2 py-1 outline-none focus:border-emerald-500"
                  >
                    {Array.from({ length: 11 }, (_, i) => (2016 + i).toString()).map((y) => (
                      <option key={y} value={y} disabled={y === year}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </footer>

        {/* DATA TICKER ROW */}
        <div className="col-span-3 row-start-4 pointer-events-auto">
          <DataTicker />
        </div>

      </div>

      {/* REPORT MODAL (Cinematic Overlay) */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-8 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-zinc-900 border border-emerald-500/20 rounded w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-emerald-500/20 flex justify-between items-center bg-black">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="text-emerald-500 w-6 h-6" />
                  <div>
                    <h2 className="text-lg font-black tracking-tight">AUDIT_CERTIFICATE</h2>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">VERIFIED_BY_TERRATRACE_AI</p>
                  </div>
                </div>
                <button onClick={() => setReport(null)} className="p-2 hover:bg-white/5 rounded transition-colors">
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-white text-black font-serif relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <TreeDeciduous className="w-96 h-96" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center border-4 border-double border-zinc-200 p-8 h-full">
                  <div className="mb-8">
                    <TreeDeciduous className="w-16 h-16 text-emerald-800 mx-auto mb-4" />
                    <h1 className="text-4xl font-black tracking-tight text-emerald-900 mb-2 font-serif uppercase">Certificate of Audit</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Planetary Verification Standard</p>
                  </div>

                  <div className="w-full h-px bg-zinc-200 my-8" />

                  <div className="w-full grid grid-cols-2 gap-8 text-left mb-12">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Project Name</p>
                      <p className="text-xl font-bold text-zinc-900 font-serif uppercase">{selectedProject?.location_name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Audit ID</p>
                      <p className="text-xl font-mono text-zinc-900">VT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Coordinates</p>
                      <p className="text-lg font-mono text-zinc-600">{selectedProject?.latitude.toFixed(6)}, {selectedProject?.longitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-1">Verification Date</p>
                      <p className="text-lg font-mono text-zinc-600">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="w-full bg-zinc-50 p-6 rounded border border-zinc-100 mb-12 text-left">
                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-2">AI Analysis Summary</p>
                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mb-2">AI Analysis Summary</p>
                    <p className="font-serif text-lg leading-relaxed text-zinc-700 italic">"{report?.replace(/\*\*/g, '')}"</p>
                  </div>

                  <div className="mt-auto w-full flex justify-between items-end">
                    <div className="text-left">
                      <div className="h-16 w-32 border-b border-zinc-300 mb-2" />
                      <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Authorized Signature</p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-24 bg-emerald-900 text-white flex items-center justify-center rounded-full font-black text-[10px] border-4 border-double border-emerald-700">
                        VERIFIED
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-emerald-500/20 bg-black flex justify-end gap-4">
                <button onClick={() => setReport(null)} className="px-6 py-2 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">DISMISS</button>
                <button onClick={() => window.print()} className="px-8 py-2 text-[10px] font-black bg-emerald-500 text-black rounded hover:bg-emerald-400 transition-colors flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  PRINT_CERTIFICATE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}

// --- Helper Components ---

function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center hover:scale-105 transition-transform"
    >
      <div className={clsx(
        "w-12 h-12 rounded border flex items-center justify-center transition-all duration-300",
        active
          ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-110"
          : "bg-zinc-900 border-emerald-500/20 text-zinc-500 hover:border-emerald-500/50 hover:text-white"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <span className={clsx(
        "absolute left-16 px-2 py-1 rounded bg-black border border-white/20 text-[8px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 -translate-x-2 transition-all duration-300 pointer-events-none text-white z-[60]",
        "group-hover:opacity-100 group-hover:translate-x-0"
      )}>
        {label}
      </span>
    </button>
  );
}

function StatWidget({ label, value, color = "text-white" }: any) {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded p-3">
      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <p className={clsx("text-lg font-black", color)}>{value}</p>
    </div>
  );
}

