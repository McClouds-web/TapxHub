import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, MessageCircle, Phone, Mail } from "lucide-react";
import { useState, FormEvent, useRef, useEffect } from "react";
import { getChatResponse } from "@/lib/gemini";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils";

const FloatingChatWidget = () => {
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [companyData, setCompanyData] = useState<any>(null);
    
    // Determine mode based on whether onboarding is complete
    const mode = companyData?.onboarding_completed ? "client" : "onboarding";
    
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            sender: 'bot', 
            text: mode === "onboarding" 
                ? `Welcome to TapxHub, ${user?.name?.split(' ')[0] || 'Partner'}! I'm the Strategy AI. Let's get your business profile set up. What's your business name?` 
                : `Hello ${user?.name?.split(' ')[0] || 'Partner'}! I'm your TapxHub Strategy AI. How can I facilitate your growth today?` 
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const actions = [
        { id: 'chatbot', icon: Bot, label: 'Strategy AI', color: 'text-white', glow: 'rgba(59, 130, 246, 0.5)', action: () => setIsChatOpen(!isChatOpen) },
        { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', color: 'text-white', glow: 'rgba(34, 197, 94, 0.3)', link: 'https://wa.me/26774327923' },
        { id: 'phone', icon: Phone, label: 'Call Support', color: 'text-white', glow: 'rgba(59, 130, 246, 0.3)', link: 'tel:+26774327923' },
        { id: 'email', icon: Mail, label: 'Email Agency', color: 'text-white', glow: 'rgba(239, 68, 68, 0.3)', link: 'mailto:tapiwa.makore@tapxmedia.com' }
    ];

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const handlePitch = (e: any) => {
            const { serviceName, pitchPrompt } = e.detail;
            setIsChatOpen(true);
            setIsTyping(true);
            
            setTimeout(async () => {
                const pitch = `I see you're interested in our **${serviceName}** module! 🚀\n\n${pitchPrompt}\n\nWould you like me to notify the team to draft a proposal?`;
                setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: pitch }]);
                setIsTyping(false);
            }, 1000);
        };

        window.addEventListener('open-chat-pitch', handlePitch as EventListener);
        return () => window.removeEventListener('open-chat-pitch', handlePitch as EventListener);
    }, []);

    useEffect(() => {
        const fetchCompany = async () => {
            if (!user?.company_id) return;
            const { data } = await supabase.from('companies').select('*').eq('id', user.company_id).single();
            if (data) setCompanyData(data);
        };
        fetchCompany();
    }, [user?.company_id]);

    useEffect(() => {
        if (isChatOpen) {
            scrollToBottom();
        }
    }, [messages, isChatOpen, isTyping]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userText = inputValue.trim();
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
        setInputValue("");
        setIsTyping(true);

        const history = messages.slice(1).map(m => ({
            role: m.sender === 'bot' ? 'model' : 'user' as "user" | "model",
            parts: [{ text: m.text }]
        }));

        const botResponse = await getChatResponse(userText, history, user?.name || "Client", mode, companyData || {});
        
        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: 'bot',
            text: botResponse
        }]);
        setIsTyping(false);
    };

    return (
        <>
            <div className={`fixed right-4 md:right-8 bottom-4 md:bottom-8 z-[110] flex flex-col gap-3 md:gap-4 pointer-events-none transition-all ${isChatOpen ? 'opacity-0 scale-90 pointer-events-none blur-sm' : 'opacity-100'}`}>
                {actions.map((action, i) => (
                    <div key={action.id} className="pointer-events-auto relative group flex items-center justify-center">
                        <AnimatePresence>
                            {isHovered === action.id && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                                    animate={{ opacity: 1, x: -20, scale: 1 }}
                                    exit={{ opacity: 0, x: -10, scale: 0.9 }}
                                    className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-1.5 bg-[#0F1E3D] text-white text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap shadow-xl"
                                >
                                    {action.label}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.a
                            href={action.link || '#'}
                            onClick={(e) => {
                                if (action.action) {
                                    e.preventDefault();
                                    action.action();
                                }
                            }}
                            className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white border border-[#0F1E3D]/10 shadow-lg overflow-hidden transition-all"
                            onMouseEnter={() => setIsHovered(action.id)}
                            onMouseLeave={() => setIsHovered(null)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <action.icon className={cn("w-5 h-5 md:w-6 md:h-6 relative z-10", action.id === 'chatbot' ? 'text-blue-600' : 'text-[#0F1E3D]')} />
                            {action.id === 'chatbot' && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                            )}
                        </motion.a>
                    </div>
                ))}
            </div>

            {/* Special Close Button when chat is open */}
            <AnimatePresence>
                {isChatOpen && (
                    <button
                        onClick={() => setIsChatOpen(false)}
                        className="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-[120] w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0F1E3D] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9, originY: 1, originX: 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-20 md:bottom-28 right-4 md:right-8 z-[110] w-[calc(100vw-2rem)] md:w-[380px] h-[580px] max-h-[70vh] bg-white border border-[#0F1E3D]/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,30,61,0.2)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#0F1E3D]/5 bg-[#F8FAFC] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#0F1E3D] flex items-center justify-center shadow-lg shadow-[#0F1E3D]/20">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-[10px] font-black text-[#0F1E3D] uppercase tracking-widest">Strategy AI</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[8px] text-[#0F1E3D]/40 font-black uppercase tracking-widest">Neural Link Active</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="p-2 text-[#0F1E3D]/30 hover:text-[#0F1E3D] transition-colors hover:bg-[#0F1E3D]/5 rounded-full">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={messagesEndRef}
                            className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 bg-white scrollbar-thin scrollbar-thumb-[#0F1E3D]/10 scrollbar-track-transparent"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("text-xs p-4 rounded-2xl shadow-sm leading-relaxed max-w-[90%]", msg.sender === 'bot' 
                                    ? 'self-start bg-[#F8FAFC] text-[#0F1E3D] rounded-tl-sm border border-[#0F1E3D]/5' 
                                    : 'self-end bg-[#0F1E3D] text-white rounded-tr-sm')}>
                                    {msg.sender === 'bot' ? (
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                                                a: ({node, ...props}) => {
                                                    const isInternal = props.href?.startsWith('/');
                                                    return <Link to={props.href || "#"} className="underline font-bold" target={isInternal ? "_self" : "_blank"}>{props.children}</Link>
                                                },
                                                strong: ({node, ...props}) => <strong {...props} className="font-black text-[#0F1E3D]" />,
                                                ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 mb-2" />,
                                                li: ({node, ...props}) => <li {...props} className="mb-1" />
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            ))}
                            {isTyping && (
                                <div className="self-start bg-[#F8FAFC] border border-[#0F1E3D]/5 p-4 rounded-2xl rounded-tl-sm">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-[#0F1E3D]/20 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-[#0F1E3D]/20 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-[#0F1E3D]/20 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-5 bg-[#F8FAFC] border-t border-[#0F1E3D]/5 shrink-0">
                            <div className="relative flex items-center group">
                                <input
                                    id="ai-chat-input"
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={isTyping ? "AI is processing..." : "Speak to your architect..."}
                                    disabled={isTyping}
                                    className="w-full bg-white border border-[#0F1E3D]/10 rounded-xl py-3.5 pl-4 pr-12 text-sm text-[#0F1E3D] placeholder-[#0F1E3D]/20 focus:outline-none focus:border-[#0F1E3D]/30 focus:ring-4 focus:ring-[#0F1E3D]/5 transition-all disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-1.5 w-9 h-9 flex items-center justify-center bg-[#0F1E3D] text-white rounded-lg hover:bg-[#1E3A8A] disabled:opacity-50 transition-all shadow-md active:scale-95"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingChatWidget;
