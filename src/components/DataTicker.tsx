'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function DataTicker() {
    return (
        <div className="w-full h-full bg-slate-950 border-t border-white/10 flex items-center overflow-hidden pointer-events-none">
            <div className="px-6 bg-slate-900 h-full flex items-center border-r border-white/10 z-10">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Global Markets</span>
            </div>
            <div className="flex-1 overflow-hidden relative h-full bg-slate-950">
                <motion.div
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute whitespace-nowrap text-[10px] font-medium text-slate-400 flex gap-12 items-center h-full"
                >
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">NCT</span>
                        <span className="text-emerald-400 font-bold">▲ $1.24</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">GEO</span>
                        <span className="text-red-400 font-bold">▼ $0.85</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">EU ETS</span>
                        <span className="text-emerald-400 font-bold">▲ €84.50</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">VCS</span>
                        <span className="text-slate-500 font-bold">─ $4.20</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">GOLD</span>
                        <span className="text-emerald-400 font-bold">▲ $12.50</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
