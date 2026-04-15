import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Paperclip, Circle } from "lucide-react";
import { cn, formatMessageTime } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import {
  useConversations,
  useConversationMessages,
  useSendConversationMessage,
  useMarkConversationRead,
} from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function ClientMessages() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: loadingConvs } = useConversations();
  const { data: messages = [], isLoading: loadingMsgs } = useConversationMessages(selectedId);
  const sendMessage = useSendConversationMessage();
  const markRead = useMarkConversationRead();

  const selected = conversations.find((c) => c.id === selectedId);

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations]);

  useEffect(() => {
    if (selectedId) {
      markRead.mutate({ conversationId: selectedId, role: "client" });
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!draft.trim() || !selectedId || !user?.id) return;
    sendMessage.mutate({
      conversationId: selectedId,
      senderId: user.id,
      senderRole: "client",
      content: draft.trim(),
    });
    setDraft("");
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-4 overflow-hidden pb-4">
      <motion.div variants={item} className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Messages</h1>
        <p className="text-[10px] text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
          Agency Communication
        </p>
      </motion.div>

      <motion.div variants={item} className="flex gap-5 flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-[280px] shrink-0 flex flex-col bg-white border border-[#0F1E3D]/5 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b border-[#0F1E3D]/5 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40">
              Your Conversations
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-3 space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-14 bg-[#F8FAFC] rounded-xl animate-pulse" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-3 text-center h-48">
                <MessageSquare className="h-8 w-8 text-[var(--brand-primary)] opacity-15 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-1">
                  No conversations yet
                </p>
                <p className="text-[10px] font-medium text-[var(--brand-primary)]/25">
                  Messages from your agency will appear here
                </p>
              </div>
            ) : (
              <div className="py-2">
                <AnimatePresence>
                  {conversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedId(conv.id)}
                      className={cn(
                        "w-full px-4 py-3.5 flex items-start gap-3 text-left transition-all border-l-2",
                        selectedId === conv.id
                          ? "bg-[#F8FAFC] border-l-[#1E3A8A]"
                          : "border-l-transparent hover:bg-[#F8FAFC]/60"
                      )}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                        T
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-extrabold text-[var(--brand-primary)] truncate">
                            TapxMedia
                          </p>
                          <span className="text-[10px] font-bold text-[var(--brand-primary)]/30 shrink-0 ml-2">
                            {formatMessageTime(conv.last_message_at)}
                          </span>
                        </div>
                        {conv.subject && (
                          <p className="text-[10px] font-medium text-[var(--brand-primary)]/50 truncate mt-0.5">
                            {conv.subject}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col bg-white border border-[#0F1E3D]/5 rounded-xl shadow-sm overflow-hidden">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-4">
                <MessageSquare className="h-7 w-7 text-[var(--brand-primary)] opacity-20" />
              </div>
              <h3 className="text-[11px] font-extrabold text-[var(--brand-primary)] mb-2">No conversation selected</h3>
              <p className="text-[10px] font-medium text-[var(--brand-primary)]/40 max-w-xs leading-relaxed">
                Select a conversation from the left to message your agency
              </p>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div className="px-4 py-4 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/50 shrink-0 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white text-[10px] font-black">
                  T
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-[var(--brand-primary)]">TapxMedia Agency</p>
                  {selected?.subject && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/40">
                      {selected.subject}
                    </p>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {loadingMsgs ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                        <div className="h-10 w-48 bg-[#F8FAFC] rounded-xl animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <MessageSquare className="h-8 w-8 text-[var(--brand-primary)] opacity-10 mb-3" />
                    <p className="text-[10px] font-bold text-[var(--brand-primary)]/40">
                      No messages yet. Send a message to your agency!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isClient = msg.sender_role === "client";
                    const showDate = i === 0 || (
                      messages[i - 1] &&
                      new Date(msg.created_at!).toDateString() !== new Date(messages[i - 1].created_at!).toDateString()
                    );
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/25 px-3 py-1 bg-[#F8FAFC] rounded-full border border-[#0F1E3D]/5">
                              {isToday(new Date(msg.created_at!))
                                ? "Today"
                                : isYesterday(new Date(msg.created_at!))
                                ? "Yesterday"
                                : format(new Date(msg.created_at!), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn("flex", isClient ? "justify-end" : "justify-start")}
                        >
                          <div className={cn(
                            "max-w-[70%] px-4 py-2.5 rounded-xl text-[10px] font-medium leading-relaxed",
                            isClient
                              ? "bg-[#0F1E3D] text-white rounded-br-md"
                              : "bg-[#F1F5F9] text-[var(--brand-primary)] rounded-bl-md"
                          )}>
                            {msg.content}
                            <div className={cn(
                              "text-[10px] mt-1 font-bold",
                              isClient ? "text-white/40 text-right" : "text-[var(--brand-primary)]/30"
                            )}>
                              {msg.created_at ? format(new Date(msg.created_at), "HH:mm") : ""}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}

          {/* Input bar */}
          <div className="px-5 py-4 border-t border-[#0F1E3D]/5 shrink-0 flex items-center gap-3">
            <button className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--brand-primary)]/30 border border-[#0F1E3D]/10 hover:bg-[#F8FAFC] transition-colors">
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={!selectedId}
              placeholder={selectedId ? "Type a message..." : "Select a conversation to start messaging..."}
              className="flex-1 bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-2.5 text-[10px] font-bold text-[var(--brand-primary)] placeholder:text-[#0F1E3D]/25 focus:outline-none focus:border-[#1E3A8A]/30 transition-colors disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!selectedId || !draft.trim() || sendMessage.isPending}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#0F1E3D] text-white hover:bg-[#1E3A8A] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
