'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function TrendsChart({ currentLoss }: { currentLoss: number }) {
  // Generate mock historical data ending at the real current loss
  const data = [
    { year: '2020', loss: 0 },
    { year: '2021', loss: currentLoss * 0.1 },
    { year: '2022', loss: currentLoss * 0.25 },
    { year: '2023', loss: currentLoss * 0.45 },
    { year: '2024', loss: currentLoss * 0.7 },
    { year: '2025', loss: currentLoss * 0.85 },
    { year: '2026', loss: currentLoss },
  ];

  return (
    <div className="w-full h-48 mt-4 bg-black/20 rounded-xl border border-white/5 p-2">
      <div className="flex justify-between items-center px-2 mb-2">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Deforestation Trend (2020-2026)</h4>
        <span className="text-[10px] font-mono text-red-400">+{currentLoss}% Loss</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="year" 
            tick={{fontSize: 10, fill: '#71717a'}} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px'}}
            itemStyle={{color: '#ef4444', fontSize: '12px', fontWeight: 'bold'}}
            labelStyle={{color: '#a1a1aa', fontSize: '10px'}}
          />
          <Area 
            type="monotone" 
            dataKey="loss" 
            stroke="#ef4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorLoss)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
