'use client';

import React, { useEffect, useState, useRef } from 'react';

interface LogEntry {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export default function SystemLog() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        const newLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type
        };
        setLogs(prev => [...prev.slice(-50), newLog]);
    };

    useEffect(() => {
        // Initial logs
        addLog('TERRATRACE OS v2.4.0 INITIALIZED', 'info');
        addLog('SATELLITE UPLINK: ESTABLISHED', 'success');
        addLog('GEE ENGINE: ONLINE', 'success');
        addLog('WAITING FOR SECTOR SELECTION...', 'info');

        // Listen for custom events (we can trigger these from page.tsx)
        const handleLogEvent = (e: any) => {
            addLog(e.detail.message, e.detail.type);
        };
        window.addEventListener('system-log', handleLogEvent);
        return () => window.removeEventListener('system-log', handleLogEvent);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="h-full flex flex-col font-mono text-[10px] bg-slate-950 p-2 border-r border-white/10">
            <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
                <span className="text-slate-500 font-bold tracking-widest uppercase text-[9px]">System Activity</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-500 font-bold text-[9px]">LIVE</span>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-1 scrollbar-none"
            >
                {logs.map(log => (
                    <div key={log.id} className="flex gap-3 items-start group">
                        <span className="text-slate-600 shrink-0 font-medium">{log.timestamp}</span>
                        <span className={clsx(
                            "font-medium leading-tight transition-colors",
                            log.type === 'success' ? 'text-emerald-400' :
                                log.type === 'error' ? 'text-red-400' :
                                    log.type === 'warning' ? 'text-amber-400' :
                                        'text-slate-400 group-hover:text-slate-200'
                        )}>
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function clsx(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
