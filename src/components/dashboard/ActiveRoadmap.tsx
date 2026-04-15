import React from 'react';
import { cn } from '@/lib/utils';
import { Lock, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export type ServiceStatus = 'locked' | 'implementing' | 'active';

interface Pillar {
  id: string;
  name: string;
  status: ServiceStatus;
}

const PILLARS: Pillar[] = [
  { id: 'seo', name: 'SEO', status: 'active' },
  { id: 'paid-ads', name: 'Paid Ads', status: 'implementing' },
  { id: 'ai', name: 'AI Chat', status: 'active' },
  { id: 'cro', name: 'CRO', status: 'locked' },
  { id: 'lead-gen', name: 'Leads', status: 'locked' },
  { id: 'email', name: 'Email', status: 'locked' },
  { id: 'content', name: 'Content', status: 'locked' },
  { id: 'social', name: 'Social', status: 'locked' },
  { id: 'video', name: 'Video', status: 'locked' },
  { id: 'branding', name: 'Brand', status: 'locked' },
  { id: 'analytics', name: 'Data', status: 'locked' },
  { id: 'sales', name: 'Sales', status: 'locked' },
  { id: 'support', name: 'Success', status: 'locked' },
];

export const ActiveRoadmap: React.FC = () => {
  const handlePillarClick = (pillar: Pillar) => {
    if (pillar.status === 'locked') {
      const event = new CustomEvent('open-chat-pitch', {
        detail: {
          serviceName: pillar.name,
          pitchPrompt: `Our ${pillar.name} system is an elite service designed to scale your brand with precision logic and automated efficiency.`
        }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full">
      {PILLARS.map((pillar) => {
        const isLocked = pillar.status === 'locked';
        const isImplementing = pillar.status === 'implementing';
        const isActive = pillar.status === 'active';

        const ItemContent = (
          <div 
            onClick={() => isLocked && handlePillarClick(pillar)}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[64px] transition-all cursor-pointer group",
              isLocked && "opacity-40 grayscale hover:grayscale-0 hover:opacity-100",
              isActive && "text-blue-600"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-500",
              isLocked ? "border-slate-200 bg-slate-50 border-dashed" :
              isImplementing ? "border-blue-400 bg-blue-50 animate-pulse" :
              "border-blue-500 bg-blue-50 blue-glow"
            )}>
              {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
              {isImplementing && <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />}
              {isActive && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500" />}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tighter text-center leading-none",
              isLocked ? "text-slate-400" : (isActive ? "text-blue-600" : "text-blue-600")
            )}>
              {pillar.name}
            </span>
          </div>
        );

        if (isLocked) return <div key={pillar.id}>{ItemContent}</div>;

        return (
          <Link 
            key={pillar.id}
            to={pillar.id === 'social' ? "/social-engine" : `/services/${pillar.id}`}
            className="outline-none"
          >
            {ItemContent}
          </Link>
        );
      })}
    </div>
  );
};
