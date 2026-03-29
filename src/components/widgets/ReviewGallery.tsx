import React from 'react';
import { Play, MessageCircle, MoreVertical } from 'lucide-react';

interface VideoRevision {
  id: string;
  title: string;
  version: number;
  thumbnail: string;
  comments: number;
  date: string;
}

const MOCK_REVISIONS: VideoRevision[] = [
  { id: '1', title: 'Brand Story Main Cut', version: 3, thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80', comments: 4, date: '2d ago' },
  { id: '2', title: 'Social Media Teaser #1', version: 2, thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=400&q=80', comments: 1, date: '4d ago' },
  { id: '3', title: 'Customer Success Interview', version: 1, thumbnail: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&w=400&q=80', comments: 0, date: '1w ago' },
];

export const ReviewGallery: React.FC = () => {
  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[#0F1E3D]">Asset Review</h3>
          <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest mt-1">Video Creative Gallery</p>
        </div>
        <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
          3 Pending
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {MOCK_REVISIONS.map((asset) => (
          <div key={asset.id} className="group relative rounded-2xl overflow-hidden border border-[#0F1E3D]/5 bg-[#F8FAFC] hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
            <div className="aspect-video w-full relative">
              <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all cursor-pointer">
                  <Play className="w-4 h-4 text-white group-hover:text-black fill-current" />
                </div>
              </div>
              <div className="absolute top-3 left-3 bg-[#0F1E3D]/80 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                v{asset.version}
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-[#0F1E3D] leading-tight line-clamp-1">{asset.title}</p>
                <span className="text-[9px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest">{asset.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 group/msg cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5 text-[#0F1E3D]/30 group-hover/msg:text-blue-600" />
                  <span className="text-[10px] font-bold text-[#0F1E3D]/40 group-hover/msg:text-blue-600">{asset.comments}</span>
                </div>
                <MoreVertical className="w-4 h-4 text-[#0F1E3D]/20 cursor-pointer hover:text-[#0F1E3D]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-3 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#0F1E3D]/10 hover:shadow-xl hover:scale-[1.02] transition-all">
        Upload New Creative
      </button>
    </div>
  );
};
