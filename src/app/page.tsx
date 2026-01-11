'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, ShieldCheck, Satellite, ArrowRight, Activity, TreeDeciduous, Terminal } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">

            {/* NAV */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <TreeDeciduous className="text-black w-6 h-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">TERRATRACE</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">LOGIN</Link>
                        <Link
                            href="/dashboard"
                            className="px-6 py-2 bg-white text-black text-xs font-black tracking-widest hover:bg-emerald-400 transition-colors"
                        >
                            LAUNCH_TERMINAL
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

                {/* Hero Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-8">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">System Online v2.5</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
                            TRUSTLESS<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">PLANETARY AUDIT</span>
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            The "Bloomberg Terminal" for Earth. We use satellite data and AI to physically verify carbon credits, detecting fraud and calculating real ecosystem value in seconds.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link
                                href="/dashboard"
                                className="group relative px-8 py-4 bg-emerald-500 text-black font-black tracking-widest overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative flex items-center gap-2">
                                    LAUNCH TERMINAL <ArrowRight className="w-4 h-4" />
                                </span>
                            </Link>
                            <button className="px-8 py-4 border border-white/20 font-bold hover:bg-white/5 transition-colors">
                                VIEW DOCUMENTATION
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-1/3 left-10 opacity-20 animate-float-slow hidden md:block">
                    <Globe className="w-64 h-64 text-emerald-500" />
                </div>
                <div className="absolute bottom-1/3 right-10 opacity-20 animate-float-slower hidden md:block">
                    <Satellite className="w-48 h-48 text-cyan-500" />
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-32 border-t border-white/10 bg-zinc-950">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={Satellite}
                            title="SATELLITE VERIFICATION"
                            desc="Direct uplink to Sentinel-2 constellation. We measure biomass density, not paper reports."
                        />
                        <FeatureCard
                            icon={Terminal}
                            title="AI ANALYSIS"
                            desc="Powered by Gemini 2.5 Flash Lite. Instant classification of land cover, risk, and biodiversity."
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="TRUSTLESS LEDGER"
                            desc="Immutable audit trails. Every verification is hashed and stored for complete transparency."
                        />
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 border-t border-white/10 bg-black text-center">
                <p className="text-zinc-600 text-xs font-mono">TERRATRACE © 2026 // PLANETARY AUDIT SYSTEM</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="p-8 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
            <div className="w-12 h-12 bg-black border border-white/20 flex items-center justify-center mb-6 group-hover:border-emerald-500/50 transition-colors">
                <Icon className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-lg font-black tracking-tight mb-4">{title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">{desc}</p>
        </div>
    );
}
