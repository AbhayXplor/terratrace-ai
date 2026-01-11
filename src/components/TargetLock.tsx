'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TargetLock() {
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
            {/* Rotating Outer Ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-[600px] h-[600px] border border-emerald-500/10 rounded-full border-dashed"
            />

            {/* Counter-Rotating Inner Ring */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-[400px] h-[400px] border border-emerald-500/20 rounded-full border-dotted opacity-50"
            />

            {/* Crosshairs */}
            <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />

            {/* Center Reticle */}
            <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute w-20 h-20 border-2 border-emerald-500/50 rounded-full flex items-center justify-center"
            >
                <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
            </motion.div>
        </div>
    );
}
