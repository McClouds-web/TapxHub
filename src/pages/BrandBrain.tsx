import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Send, Sparkles, Copy, RefreshCcw, 
  MessageSquare, UserCircle, Zap, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PERSONAS = [
  { id: 'punchy', name: 'Punchy & Bold', icon: Zap, color: 'text-amber-500' },
  { id: 'professional', name: 'Corporate Elite', icon: ShieldCheck, color: 'text-blue-500' },
  { id: 'founder', name: 'Visionary Founder', icon: UserCircle, color: 'text-purple-500' },
];

export default function BrandBrain() {
  const [input, setInput] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('punchy');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!input) return;
    setIsGenerating(true);
    // Simulated AI generation
    setTimeout(() => {
      setOutput(`[${selectedPersona.toUpperCase()} VOICE]: Your brand is more than just a logo. It's a high-performance engine for growth. Leveraging our ultimate Growth OS means you aren't just keeping up—you're defining the new standard of excellence.`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-card p-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0F1E3D] flex items-center justify-center shadow-xl shadow-[#0F1E3D]/20">
               <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-[#0F1E3D]">Brand Brain AI</h1>
               <p className="text-[10px] text-[#0F1E3D]/40 font-black uppercase tracking-[0.2em]">The Infinite Content Engine</p>
            </div>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left: Engine Controls */}
        <div className="lg:col-span-12 h-full flex flex-col gap-6">
           <div className="glass-card p-8 flex-1 flex flex-col gap-6">
              
              {/* Persona Selector */}
              <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                 {PERSONAS.map((p) => (
                   <div 
                     key={p.id}
                     onClick={() => setSelectedPersona(p.id)}
                     className={cn(
                       "flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all border shrink-0",
                       selectedPersona === p.id 
                        ? "bg-[#0F1E3D] border-[#0F1E3D] text-white shadow-xl shadow-[#0F1E3D]/10" 
                        : "bg-white border-[#0F1E3D]/5 text-[#0F1E3D]/60 hover:bg-[#F8FAFC]"
                     )}
                   >
                     <p.icon className={cn("w-4 h-4", selectedPersona === p.id ? "text-white" : p.color)} />
                     <span className="text-xs font-bold whitespace-nowrap">{p.name}</span>
                   </div>
                 ))}
              </div>

              {/* Input Area */}
              <div className="relative group flex-1 min-h-[150px]">
                 <textarea 
                   className="w-full h-full bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-3xl p-6 text-sm font-medium text-[#0F1E3D] focus:outline-none focus:ring-2 focus:ring-[#0F1E3D]/10 resize-none transition-all"
                   placeholder="Describe your content idea or paste a draft here..."
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                 />
                 <div className="absolute bottom-4 right-4">
                    <button 
                      onClick={handleGenerate}
                      disabled={!input || isGenerating}
                      className="bg-[#0F1E3D] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#1E3A8A] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                      {isGenerating ? 'Generating...' : 'Fuel Engine'}
                    </button>
                 </div>
              </div>

              {/* Output Area */}
              <AnimatePresence>
                {output && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-[#0F1E3D]/5 rounded-3xl p-8 relative group"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 hover:bg-[#F8FAFC] rounded-xl text-[#0F1E3D]/40 hover:text-[#0F1E3D] transition-all">
                          <Copy className="w-4 h-4" />
                       </button>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                       <Sparkles className="w-4 h-4 text-amber-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Generated Output</span>
                    </div>
                    <p className="text-base font-medium text-[#0F1E3D] leading-relaxed">
                      {output}
                    </p>
                    <div className="mt-8 pt-6 border-t border-[#0F1E3D]/5 flex items-center justify-between">
                       <div className="flex gap-4">
                          <button className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 hover:text-[#0F1E3D]">Save to Vault</button>
                          <button className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/40 hover:text-[#0F1E3D]">Post to Social</button>
                       </div>
                       <span className="text-[10px] font-bold text-[#0F1E3D]/20">AI Engine v2.0</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
