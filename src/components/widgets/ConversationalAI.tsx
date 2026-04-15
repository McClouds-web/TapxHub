import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChatResponse } from '@/lib/gemini';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export const ConversationalAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Strategy AI. Ask me anything about your growth operations, ROI metrics, or marketing strategy."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const fetchCompany = async () => {
        if (!user?.company_id) return;
        const { data } = await supabase.from('companies').select('*').eq('id', user.company_id).single();
        if (data) setCompanyData(data);
    };
    fetchCompany();
  }, [user?.company_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user' as "user" | "model",
          parts: [{ text: m.content }]
      }));

      const aiResponse = await getChatResponse(
          input, 
          history, 
          user?.name || "Partner", 
          "client", 
          companyData || {}
      );

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse
      }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm currently optimizing my strategic models. Please reach out to your account manager if you need immediate assistance."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-[#0F1E3D]/10 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-4 bg-[#F8FAFC] border-b border-[#0F1E3D]/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-[#0F1E3D] flex items-center justify-center shadow-lg shadow-[#0F1E3D]/10">
                <Sparkles className="w-4 h-4 text-white" />
             </div>
             <div>
               <h3 className="text-[10px] font-black text-[#0F1E3D] uppercase tracking-widest">Growth Architect</h3>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[10px] text-[#0F1E3D]/40 font-black uppercase tracking-widest">AI Strategy Active</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesEndRef}
        className="flex-1 overflow-y-auto p-3 space-y-4 bg-white scrollbar-thin scrollbar-thumb-[#0F1E3D]/10 scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex items-start gap-4 w-full", msg.role === 'user' ? "flex-row-reverse" : "")}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                msg.role === 'user' ? "bg-[#0F1E3D] text-white border-[#0F1E3D]" : "bg-[#F8FAFC] border-[#0F1E3D]/10 text-[#0F1E3D]"
              )}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              
              <div className={cn(
                "max-w-[85%] rounded-xl p-3 text-[10px] leading-relaxed shadow-sm",
                msg.role === 'user'
                  ? "bg-[#0F1E3D] text-white rounded-tr-none font-medium"
                  : "bg-[#F8FAFC] text-[#0F1E3D] rounded-tl-none border border-[#0F1E3D]/5"
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:mb-2 last:prose-p:mb-0 text-[#0F1E3D]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#0F1E3D]/10 flex items-center justify-center shadow-sm text-[#0F1E3D]">
                 <Bot size={14} />
               </div>
               <div className="bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl rounded-tl-none p-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#0F1E3D]/20 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[#0F1E3D]/20 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#0F1E3D]/20 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#F8FAFC] border-t border-[#0F1E3D]/5 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            id="ai-chat-input"
            placeholder="Ask about strategy, ROI, or projects..."
            disabled={isTyping}
            className="w-full bg-white border border-[#0F1E3D]/10 text-[#0F1E3D] text-[10px] font-medium placeholder-[#0F1E3D]/20 focus:outline-none focus:border-[#0F1E3D]/30 focus:ring-4 focus:ring-[#0F1E3D]/5 rounded-xl py-3.5 pl-4 pr-12 shadow-sm transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 p-2 bg-[#0F1E3D] text-white rounded-lg hover:bg-[#1E3A8A] transition-all disabled:opacity-50 shadow-md active:scale-95"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
