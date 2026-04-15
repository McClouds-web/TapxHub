import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { Activity, Globe, MousePointer2, PieChart } from 'lucide-react';

const DATA = [
  { name: 'Mon', views: 4000, conv: 240 },
  { name: 'Tue', views: 3000, conv: 139 },
  { name: 'Wed', views: 2000, conv: 980 },
  { name: 'Thu', views: 2780, conv: 390 },
  { name: 'Fri', views: 1890, conv: 480 },
  { name: 'Sat', views: 2390, conv: 380 },
  { name: 'Sun', views: 3490, conv: 430 },
];

export const AnalyticsDash = () => {
  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="glass-card p-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]">Data Intelligence</h3>
              <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest">Real-time Traffic & Behavior</p>
           </div>
           <PieChart className="w-5 h-5 text-blue-600" />
        </div>

        <div className="h-[250px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                 <defs>
                   <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#0F1E3D4D'}} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0F1E3D', borderRadius: '12px', border: 'none', color: '#fff' }}
                   itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                 />
                 <Area type="monotone" dataKey="views" stroke="#1E3A8A" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
           </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'Avg Session', val: '4m 12s', icon: Activity },
             { label: 'Unique Visitors', val: '12,482', icon: Globe },
           ].map((item, i) => (
             <div key={i} className="p-3 bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#0F1E3D]/5 flex items-center justify-center shadow-sm">
                   <item.icon className="w-4 h-4 text-[#1E3A8A]" />
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase text-[#0F1E3D]/30 block">{item.label}</span>
                   <span className="text-[10px] font-black text-[#0F1E3D]">{item.val}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
