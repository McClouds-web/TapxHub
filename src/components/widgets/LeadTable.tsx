import React from 'react';
import { Mail, Phone, ExternalLink, MoreVertical } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: 'new' | 'contacted' | 'converted';
  date: string;
}

const MOCK_LEADS: Lead[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@startup.io', source: 'Google Ads', status: 'new', date: '2h ago' },
  { id: '2', name: 'Sarah Miller', email: 'smiller@enterprise.com', source: 'SEO', status: 'contacted', date: '5h ago' },
  { id: '3', name: 'Mike Ross', email: 'mike@legal.co', source: 'Direct', status: 'converted', date: '1d ago' },
  { id: '4', name: 'Emma Wilson', email: 'emma.w@tech.net', source: 'LinkedIn', status: 'new', date: '1d ago' },
];

export const LeadTable: React.FC = () => {
  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D]">Lead Pipeline</h3>
          <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest mt-1">Live Conversion Stream</p>
        </div>
        <button className="p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors">
          <MoreVertical className="w-4 h-4 text-[#0F1E3D]/40" />
        </button>
      </div>

      <div className="flex-1 overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#0F1E3D]/5">
              <th className="py-3 text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Contact</th>
              <th className="py-3 text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Source</th>
              <th className="py-3 text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Status</th>
              <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/30">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0F1E3D]/5">
            {MOCK_LEADS.map((lead) => (
              <tr key={lead.id} className="group hover:bg-[#F8FAFC]/50 transition-all">
                <td className="py-3">
                  <p className="text-xs font-bold text-[#0F1E3D]">{lead.name}</p>
                  <p className="text-[10px] text-[#0F1E3D]/40 font-medium">{lead.email}</p>
                </td>
                <td className="py-3">
                  <span className="text-[10px] font-bold text-[#0F1E3D]/60 bg-slate-100 px-2 py-0.5 rounded-md">{lead.source}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      lead.status === 'new' ? 'bg-blue-500 animate-pulse' :
                      lead.status === 'contacted' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-[#0F1E3D]">{lead.status}</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-blue-50 rounded-md text-blue-600"><Mail className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 hover:bg-amber-50 rounded-md text-amber-600"><Phone className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-md text-[#0F1E3D]"><ExternalLink className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#0F1E3D]/5 flex items-center justify-between">
        <span className="text-[9px] font-bold text-[#0F1E3D]/30 uppercase tracking-widest">Showing last 4 leads</span>
        <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Download CSV</button>
      </div>
    </div>
  );
};
