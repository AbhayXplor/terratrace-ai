'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, Satellite, Globe } from 'lucide-react';

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const bootSteps = [
        { text: "INITIALIZING KERNEL...", delay: 500 },
        { text: "CONNECTING TO SENTINEL-2 SATELLITE NETWORK...", delay: 800 },
        { text: "ESTABLISHING SECURE HANDSHAKE...", delay: 600 },
        { text: "LOADING GEOSPATIAL DATASETS...", delay: 700 },
        { text: "VERIFYING BIOMASS INTEGRITY SIGNATURES...", delay: 900 },
        { text: "SYSTEM ONLINE.", delay: 500 }
    ];

    useEffect(() => {
        let currentDelay = 0;

        bootSteps.forEach((s, i) => {
            currentDelay += s.delay;
            setTimeout(() => {
                setLogs(prev => [...prev, s.text]);
                setStep(i + 1);
            }, currentDelay);
        });

        setTimeout(() => {
            onComplete();
        }, currentDelay + 1000);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono text-emerald-500 p-8"
            exit={{ opacity: 0, transition: { duration: 1 } }}
        >
            <div className="w-full max-w-md space-y-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/50 animate-pulse">
                        <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white">TERRATRACE OS</h1>
                        <p className="text-xs text-emerald-500/50 font-bold tracking-[0.3em]">V.3.0.0 // BOOTLOADER</p>
                    </div>
                </div>

                <div className="h-64 overflow-hidden border border-emerald-900/50 bg-emerald-950/10 rounded-xl p-4 font-xs shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-2 flex items-center gap-2"
                        >
                            <span className="text-emerald-700">{`>`}</span>
                            <span className={i === logs.length - 1 ? "text-emerald-400 font-bold" : "text-emerald-600"}>{log}</span>
                        </motion.div>
                    ))}
                    <div className="w-2 h-4 bg-emerald-500 animate-pulse inline-block" />
                </div>

                <div className="w-full bg-emerald-900/20 h-1 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "easeInOut" }}
                    />
                </div>

                <div className="flex justify-between text-[10px] text-emerald-700 font-bold tracking-widest uppercase">
                    <span>Mem: 64TB OK</span>
                    <span>Net: SECURE</span>
                    <span>GPU: ONLINE</span>
                </div>
            </div>
        </motion.div>
    );
}
