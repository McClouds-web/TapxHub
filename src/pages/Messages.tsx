import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search, Send, Paperclip, Plus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import {
  useConversations,
  useConversationMessages,
  useSendConversationMessage,
  useMarkConversationRead,
  useCreateConversation,
  useCompanies,
  type Conversation,
} from "@/hooks/useAppData";
import { supabase } from "@/lib/supabase";

const ADMIN_ID = "admin-mock-id"; // replaced by real auth.uid() in production

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Messages() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [showNewConv, setShowNewConv] = useState(false);
  const [newCompanyId, setNewCompanyId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading: loadingConvs } = useConversations();
  const { data: messages = [], isLoading: loadingMsgs } = useConversationMessages(selectedId);
  const sendMessage = useSendConversationMessage();
  const markRead = useMarkConversationRead();
  const createConversation = useCreateConversation();
  const { data: companies = [] } = useCompanies();

  const selected = conversations.find((c) => c.id === selectedId);

  // Mark messages as read when switching conversations
  useEffect(() => {
    if (selectedId) {
      markRead.mutate({ conversationId: selectedId, role: "admin" });
    }
  }, [selectedId]);

  // Scroll to bottom when messages load or new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = conversations.filter((c) =>
    (c.company_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.subject ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleSend() {
    if (!draft.trim() || !selectedId) return;
    const { data: { user } } = await supabase.auth.getUser();
    sendMessage.mutate({
      conversationId: selectedId,
      senderId: user?.id ?? ADMIN_ID,
      senderRole: "admin",
      content: draft.trim(),
    });
    setDraft("");
  }

  async function handleCreateConversation() {
    if (!newCompanyId) return;
    const conv = await createConversation.mutateAsync({
      companyId: newCompanyId,
      subject: newSubject || undefined,
    });
    setSelectedId(conv.id);
    setShowNewConv(false);
    setNewCompanyId("");
    setNewSubject("");
  }

  // Count unread per conversation (messages from client, not yet read)
  function unreadCount(conv: Conversation) {
    // Approximate from conversations data — actual count requires per-conv query
    return 0;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-6 overflow-hidden pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Messages</h1>
          <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Client Conversations
          </p>
        </div>
        <button
          onClick={() => setShowNewConv(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" /> New Conversation
        </button>
      </motion.div>

      {/* Two-panel layout */}
      <motion.div variants={item} className="flex gap-5 flex-1 min-h-0">

        {/* Left panel — conversation list */}
        <div className="w-[300px] shrink-0 flex flex-col bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b border-[#0F1E3D]/5 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--brand-primary)]/30 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-[var(--brand-primary)] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[#1E3A8A]/30 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-[#F8FAFC] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
                <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-3">
                  <MessageSquare className="h-5 w-5 text-[var(--brand-primary)] opacity-25" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-1">
                  No conversations yet
                </p>
                <p className="text-[10px] font-medium text-[var(--brand-primary)]/30">
                  Click "New Conversation" to start
                </p>
              </div>
            ) : (
              <div className="py-2">
                <AnimatePresence>
                  {filtered.map((conv) => (
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
                      <div className="w-9 h-9 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white text-xs font-black shrink-0">
                        {(conv.company_name ?? "?").charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-[var(--brand-primary)] truncate">
                            {conv.company_name}
                          </p>
                          <span className="text-[9px] font-bold text-[var(--brand-primary)]/30 shrink-0 ml-2">
                            {formatTime(conv.last_message_at)}
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

        {/* Right panel — message view */}
        <div className="flex-1 flex flex-col bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm overflow-hidden">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare className="h-7 w-7 text-[var(--brand-primary)] opacity-20" />
              </div>
              <h3 className="text-lg font-extrabold text-[var(--brand-primary)] mb-2">No conversation selected</h3>
              <p className="text-sm font-medium text-[var(--brand-primary)]/40 max-w-xs leading-relaxed">
                Select a client conversation from the left or start a new one with a client
              </p>
            </div>
          ) : (
            <>
              {/* Conversation header */}
              <div className="px-6 py-4 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/50 shrink-0 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white text-xs font-black">
                  {(selected?.company_name ?? "?").charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[var(--brand-primary)]">{selected?.company_name}</p>
                  {selected?.subject && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/40">
                      {selected.subject}
                    </p>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {loadingMsgs ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                        <div className="h-10 w-48 bg-[#F8FAFC] rounded-2xl animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-8 w-8 text-[var(--brand-primary)] opacity-10 mb-3" />
                    <p className="text-xs font-bold text-[var(--brand-primary)]/40">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isAdmin = msg.sender_role === "admin";
                    const showDate = i === 0 || (
                      messages[i - 1] &&
                      new Date(msg.created_at!).toDateString() !== new Date(messages[i - 1].created_at!).toDateString()
                    );
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/25 px-3 py-1 bg-[#F8FAFC] rounded-full border border-[#0F1E3D]/5">
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
                          className={cn("flex", isAdmin ? "justify-end" : "justify-start")}
                        >
                          <div className={cn(
                            "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed",
                            isAdmin
                              ? "bg-[#0F1E3D] text-white rounded-br-md"
                              : "bg-[#F1F5F9] text-[var(--brand-primary)] rounded-bl-md"
                          )}>
                            {msg.content}
                            <div className={cn(
                              "text-[9px] mt-1 font-bold",
                              isAdmin ? "text-white/40 text-right" : "text-[var(--brand-primary)]/30"
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
              className="flex-1 bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--brand-primary)] placeholder:text-[#0F1E3D]/25 focus:outline-none focus:border-[#1E3A8A]/30 transition-colors disabled:cursor-not-allowed"
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

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowNewConv(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#0F1E3D]/5"
            >
              <h2 className="text-xl font-extrabold text-[var(--brand-primary)] mb-1">New Conversation</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mb-6">
                Start a conversation with a client
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">
                    Client Company *
                  </label>
                  <select
                    value={newCompanyId}
                    onChange={(e) => setNewCompanyId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  >
                    <option value="">Select a company...</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">
                    Subject (optional)
                  </label>
                  <input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Q1 Campaign Update"
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] placeholder:font-medium placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowNewConv(false)}
                  className="flex-1 px-4 py-3 bg-[#F8FAFC] text-[var(--brand-primary)] rounded-xl text-xs font-black uppercase tracking-widest border border-[#0F1E3D]/10 hover:bg-[#F1F5F9] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateConversation}
                  disabled={!newCompanyId || createConversation.isPending}
                  className="flex-1 px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md disabled:opacity-50"
                >
                  {createConversation.isPending ? "Creating..." : "Start Conversation"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
