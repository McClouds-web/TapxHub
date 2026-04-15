import React from 'react';
import { ActiveRoadmap } from './ActiveRoadmap';
import { TrendingUp } from 'lucide-react';

export const RevenuePulse: React.FC = () => {
  return (
    <div className="glass-card px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-5 border-none">
      {/* North Star Metric */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <TrendingUp className="text-white w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F1E3D]/40 leading-none mb-1">North Star Metric</p>
          <p className="text-[13px] font-black text-[#0F1E3D] leading-none">$12,450.00</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">+18.4% Revenue Growth</span>
          </div>
        </div>
      </div>

      {/* Vertical Divider (Desktop) */}
      <div className="hidden md:block w-px h-10 bg-[#0F1E3D]/5" />

      {/* Roadmap Visualization */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F1E3D]/40 leading-none">Growth OS Roadmap (13 Pillars)</p>
          <span className="text-[10px] font-bold uppercase text-blue-500 tracking-widest">3 / 13 Pillars Active</span>
        </div>
        <ActiveRoadmap />
      </div>
    </div>
  );
};
