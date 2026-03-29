import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Keyword {
  phrase: string;
  rank: number;
  change: number;
  volume: string;
}

const MOCK_KEYWORDS: Keyword[] = [
  { phrase: 'marketing agency london', rank: 3, change: 2, volume: '12k' },
  { phrase: 'ai automation services', rank: 1, change: 0, volume: '8.4k' },
  { phrase: 'b2b lead generation', rank: 7, change: -1, volume: '25k' },
  { phrase: 'growth os software', rank: 2, change: 5, volume: '1.2k' },
  { phrase: 'tapxmedia reviews', rank: 1, change: 0, volume: '400' },
];

export const SEOTracker: React.FC = () => {
  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D]">Keyword Rankings</h3>
          <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest mt-1">Live Search Engine Positioning</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          +12.4% Visibility
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_KEYWORDS.map((kw, i) => (
          <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-[#F8FAFC] p-2 -mx-2 rounded-xl transition-all">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-[#0F1E3D]/20 w-4">#{kw.rank}</span>
              <div>
                <p className="text-xs font-bold text-[#0F1E3D]">{kw.phrase}</p>
                <p className="text-[9px] text-[#0F1E3D]/40 font-bold uppercase tracking-tight">{kw.volume} Search Volume</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-md",
                kw.change > 0 ? "text-emerald-600 bg-emerald-500/10" : 
                kw.change < 0 ? "text-rose-600 bg-rose-500/10" : 
                "text-slate-400 bg-slate-100"
              )}>
                {kw.change > 0 && <ArrowUpRight className="w-3 h-3" />}
                {kw.change < 0 && <ArrowDownRight className="w-3 h-3" />}
                {kw.change === 0 && <Minus className="w-3 h-3" />}
                {Math.abs(kw.change)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-3 border border-[#0F1E3D]/5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-[#0F1E3D]/40 hover:bg-[#0F1E3D] hover:text-white transition-all">
        View Full Search Report
      </button>
    </div>
  );
};
