import React from 'react';
import { TrendingUp, DollarSign, Target } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const MOCK_DATA = [
  { day: 'Mon', roas: 3.2, spend: 400 },
  { day: 'Tue', roas: 4.1, spend: 350 },
  { day: 'Wed', roas: 3.8, spend: 500 },
  { day: 'Thu', roas: 5.2, spend: 450 },
  { day: 'Fri', roas: 4.5, spend: 600 },
  { day: 'Sat', roas: 6.1, spend: 300 },
  { day: 'Sun', roas: 5.8, spend: 250 },
];

export const AdsROI: React.FC = () => {
  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D]">Performance Engine</h3>
          <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest mt-1">ROI & Spend Analysis</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#0F1E3D]/5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-3 h-3 text-blue-600" />
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#0F1E3D]/40">Total Spend</span>
          </div>
          <p className="text-xl font-black text-[#0F1E3D]">$2,850.00</p>
        </div>
        <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#0F1E3D]/5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3 h-3 text-emerald-600" />
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#0F1E3D]/40">Avg ROAS</span>
          </div>
          <p className="text-xl font-black text-[#0F1E3D]">4.5x</p>
        </div>
      </div>

      <div className="h-48 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_DATA}>
            <Tooltip 
              cursor={{ fill: 'rgba(15,30,61,0.03)' }}
              contentStyle={{ background: '#0F1E3D', borderRadius: '12px', border: 'none', color: '#fff' }}
              itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
            />
            <Bar dataKey="roas" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#0F1E3D]/5">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/40">Daily ROAS Trend</span>
        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">+0.8pts increase</span>
      </div>
    </div>
  );
};
