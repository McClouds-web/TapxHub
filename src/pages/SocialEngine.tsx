import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Calendar as CalendarIcon,
  LayoutDashboard, Instagram, Facebook, Twitter,
  Linkedin, Youtube, MoreHorizontal, Clock,
  CheckCircle2, AlertCircle, X, Upload,
  FileVideo, Image as ImageIcon, Layers,
  ChevronRight, ArrowRight, User, Hash,
  MessageSquare, Trash2, Edit3, BarChart3,
  ListTodo, CalendarDays, ExternalLink,
  Shield, Zap, Sparkles, Download, Check, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  useProfile,
  useCompanies,
  useSocialContent,
  useAddSocialContent,
  useUpdateSocialContent,
  useDeleteSocialContent,
  useAddTask,
  useUploadFile,
  type SocialContent,
  type Company
} from "@/hooks/useAppData";

// ─── Constants ───────────────────────────────────────────────────────────────

const STAGES = [
  { id: 'idea',        label: 'Idea',        color: 'text-gray-500',   bg: 'bg-gray-50',    border: 'border-gray-200' },
  { id: 'draft',       label: 'Draft',       color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-200' },
  { id: 'in_review',   label: 'In Review',   color: 'text-blue-500',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  { id: 'approved',    label: 'Approved',    color: 'text-emerald-500',bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'scheduled',   label: 'Scheduled',   color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'published',   label: 'Published',   color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200' },
] as const;

const PLATFORMS = [
  { id: 'Instagram', icon: <Instagram className="w-4 h-4" />, color: 'text-pink-600' },
  { id: 'Facebook',  icon: <Facebook className="w-4 h-4" />,  color: 'text-blue-600' },
  { id: 'Twitter',   icon: <Twitter className="w-4 h-4" />,   color: 'text-sky-500' },
  { id: 'LinkedIn',  icon: <Linkedin className="w-4 h-4" />,  color: 'text-blue-700' },
  { id: 'TikTok',    icon: <Youtube className="w-4 h-4" />,   color: 'text-black' },
];

const CONTENT_TYPES = [
  { id: 'post',     label: 'Post',     icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'reel',     label: 'Reel',     icon: <FileVideo className="w-4 h-4" /> },
  { id: 'story',    label: 'Story',    icon: <Zap className="w-4 h-4" /> },
  { id: 'carousel', label: 'Carousel', icon: <Layers className="w-4 h-4" /> },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SocialEngine() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const isAdmin = profile?.role === 'admin';
  const { data: companies = [] } = useCompanies();

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(profile?.company_id);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'calendar' | 'analytics'>('pipeline');
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialContent | null>(null);

  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');

  const { data: content = [], isLoading, isError, error } = useSocialContent(isAdmin ? selectedCompanyId : profile?.company_id);

  React.useEffect(() => {
    if (isError) console.error("SocialEngine failed to load data:", error);
  }, [isError, error]);

  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const matchesSearch = !search ||
        item.caption?.toLowerCase().includes(search.toLowerCase()) ||
        item.notes?.toLowerCase().includes(search.toLowerCase());
      const matchesPlatform = filterPlatform === 'all' || item.platform === filterPlatform;
      return matchesSearch && matchesPlatform;
    });
  }, [content, search, filterPlatform]);

  const selectedCompany = useMemo(() =>
    companies.find(c => c.id === (isAdmin ? selectedCompanyId : profile?.company_id)),
    [companies, selectedCompanyId, profile?.company_id, isAdmin]
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white rounded-[32px] border border-gray-100 m-2">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-5 overflow-hidden text-[#0F1E3D] font-sans pb-4">

      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F1E3D] flex items-center justify-center shadow-lg group hover:rotate-6 transition-transform">
             <LayoutDashboard className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0F1E3D] leading-none uppercase tracking-tight">Social Engine</h1>
            <div className="flex items-center gap-2 mt-1.5">
               <Shield className="w-3.5 h-3.5 text-[#3b82f6]"/>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 System Active: {content.length} fragments tracked
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <select
              value={selectedCompanyId || ''}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest focus:outline-none shadow-sm min-w-[180px]"
            >
              <option value="">All Regions</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          <div className="flex bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl p-1 shadow-sm">
            <TabButton active={activeTab === 'pipeline'} onClick={() => setActiveTab('pipeline')} icon={<ListTodo className="w-3.5 h-3.5"/>} label="Pipeline" />
            <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarDays className="w-3.5 h-3.5"/>} label="Chronos" />
            <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart3 className="w-3.5 h-3.5"/>} label="Metrics" />
          </div>

          <button
            onClick={() => setIsAddingPost(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-[#1e3a8a] transition-all shadow-xl shadow-[#0F1E3D]/10 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]"/> New Fragment
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 px-2 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full flex flex-col gap-4"
            >
              <PipelineView
                content={filteredContent}
                onEdit={(item) => { setEditingPost(item); setIsAddingPost(true); }}
              />
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto no-scrollbar"
            >
              <CalendarTracker content={filteredContent} onEdit={(item) => { setEditingPost(item); setIsAddingPost(true); }} />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full overflow-y-auto no-scrollbar"
            >
              <MetricsDashboard items={content} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddingPost && (
          <PostModal
            post={editingPost}
            companyId={isAdmin ? selectedCompanyId : profile?.company_id}
            onClose={() => { setIsAddingPost(false); setEditingPost(null); }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// ─── Sub-Views ───────────────────────────────────────────────────────────────

function PipelineView({ content, onEdit }: { content: SocialContent[], onEdit: (item: SocialContent) => void }) {
  const updateContent = useUpdateSocialContent();
  const addTask = useAddTask();

  const handleDrop = async (e: React.DragEvent, status: SocialContent['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('postId');
    if (!id) return;
    try {
      await updateContent.mutateAsync({ id, status });
      toast.success(`Fragment transitioned to ${status}`);
    } catch {
      toast.error("Transition failed");
    }
  };

  return (
    <div className="flex-1 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
      {STAGES.map(stage => {
        const stageItems = content.filter(item => item.status === stage.id);
        return (
          <div
            key={stage.id}
            className="flex flex-col w-[320px] shrink-0 gap-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="flex items-center justify-between px-3 py-1">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", stage.color.replace('text', 'bg'))} />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0F1E3D]">{stage.label}</h3>
                <span className="bg-gray-100 text-[10px] font-bold px-2 py-0.5 rounded-full text-gray-400">
                  {stageItems.length}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-300">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 min-h-[300px]">
              {stageItems.length === 0 && (
                <div className="flex-1 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 text-center min-h-[120px]">
                  <p className="text-[10px] font-bold text-gray-300">Create your first social post.</p>
                </div>
              )}
              {stageItems.map(item => (
                <ContentCard key={item.id} item={item} onEdit={onEdit} />
              ))}

              <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold text-gray-300 hover:border-indigo-200 hover:text-indigo-400 hover:bg-indigo-50/30 transition-all">
                <Plus className="w-3.5 h-3.5"/> Add Fragment
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContentCard({ item, onEdit }: { item: SocialContent, onEdit: (item: SocialContent) => void }) {
  const platform = PLATFORMS.find(p => p.id === item.platform);
  const type = CONTENT_TYPES.find(t => t.id === item.content_type);

  return (
    <motion.div
      layoutId={item.id}
      draggable
      onDragStart={(e) => { e.dataTransfer.setData('postId', item.id); }}
      onClick={() => onEdit(item)}
      className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
          item.platform === 'Instagram' ? 'bg-pink-50 text-pink-600' :
          item.platform === 'TikTok' ? 'bg-gray-50 text-black' : 'bg-blue-50 text-blue-600'
        )}>
           {platform?.icon} {item.platform}
        </div>
        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-300 uppercase tracking-widest">
           {type?.icon} {type?.label}
        </div>
      </div>

      <p className="text-[12px] font-bold text-[#0F1E3D] leading-relaxed mb-4 line-clamp-3">
        {item.caption || "No content fragment drafted."}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-500 uppercase">
             {item.company_id.slice(0, 1)}
           </div>
           <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
             {item.scheduled_date ? format(new Date(item.scheduled_date), 'MMM d') : 'Pending Schedule'}
           </span>
        </div>

        <div className="flex gap-1">
          {item.approval_status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
          {item.approval_status === 'revision_requested' && <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
        </div>
      </div>
    </motion.div>
  );
}

function CalendarTracker({ content, onEdit }: { content: SocialContent[], onEdit: (item: SocialContent) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/30">
        <div className="flex flex-col gap-1">
           <h2 className="text-[16px] font-black text-[#0F1E3D] uppercase tracking-tight">Chronos Scheduler</h2>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content Distribution Pipeline</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
           <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><ArrowRight className="w-4 h-4 rotate-180"/></button>
           <span className="text-[11px] font-black uppercase tracking-widest min-w-[140px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
           <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><ArrowRight className="w-4 h-4"/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 flex-1 border-b border-gray-50 min-h-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-300 border-r border-gray-50 last:border-0">{d}</div>
        ))}
        {days.map((day, i) => {
          const dayPosts = content.filter(item => item.scheduled_date && isSameDay(new Date(item.scheduled_date), day));
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[140px] p-2 border-r border-t border-gray-50 flex flex-col gap-1.5 relative group hover:bg-gray-50/50 transition-colors",
                (i + 1) % 7 === 0 && "border-r-0"
              )}
            >
              <span className="text-[10px] font-black text-gray-200 group-hover:text-indigo-400 transition-colors">{format(day, 'd')}</span>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                {dayPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => onEdit(post)}
                    className={cn(
                      "px-2 py-1.5 rounded-lg border text-[9px] font-bold flex items-center justify-between transition-all cursor-pointer hover:shadow-lg",
                      post.status === 'published' ? 'bg-violet-50 border-violet-100 text-violet-600' :
                      post.status === 'scheduled' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-50 border-gray-100'
                    )}
                  >
                    <span className="truncate">{post.platform} {post.content_type}</span>
                    <Clock className="w-3 h-3 shrink-0 opacity-40" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricsDashboard({ items }: { items: SocialContent[] }) {
  const publishedCount = items.filter(i => i.status === 'published').length;
  const scheduledCount = items.filter(i => i.status === 'scheduled').length;
  const approvalRate = Math.round((items.filter(i => i.status === 'approved' || i.status === 'scheduled' || i.status === 'published').length / (items.length || 1)) * 100);

  const dynamicChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      posts: items.filter(i => format(new Date(i.created_at), 'EEE') === day).length
    }));
  }, [items]);

  const dynamicPieData = useMemo(() => {
    return PLATFORMS.map((p, idx) => ({
      name: p.id,
      value: items.filter(i => i.platform === p.id).length,
      color: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][idx % 5]
    })).filter(p => p.value > 0);
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-0">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-8 bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm flex flex-col">
         <div className="flex justify-between items-start mb-8">
            <div>
               <h3 className="text-[16px] font-black uppercase tracking-tight">Signal Distribution</h3>
               <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">Multi-Channel Output Analysis</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100">Live Optimization</div>
         </div>
         <div className="flex-1 h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={dynamicChartData}>
                  <defs>
                     <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                  <YAxis hide />
                  <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 700 }} />
                  <Area type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorWave)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </motion.div>

      <div className="md:col-span-4 flex flex-col gap-5">
         <div className="bg-[#0F1E3D] rounded-[32px] p-8 text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-700"/>
            <div className="relative z-10">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-10">Signal Mastery</h4>
               <p className="text-5xl font-black tracking-tighter mb-2">{approvalRate}%</p>
               <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">Approval Success Coefficient</p>
            </div>
            <div className="flex gap-4 mt-12 relative z-10">
               <div className="flex-1">
                  <p className="text-[18px] font-black">{publishedCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Published</p>
               </div>
               <div className="flex-1">
                  <p className="text-[18px] font-black">{scheduledCount}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">In Queue</p>
               </div>
            </div>
         </div>

         <div className="bg-white border border-gray-100 rounded-[32px] p-8 flex-1 flex flex-col shadow-sm">
            <h4 className="text-[12px] font-black uppercase tracking-tight mb-6">Channel Share</h4>
            {dynamicPieData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest text-center">No data yet.<br/>Create your first social post.</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                 <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                       <Pie data={dynamicPieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                          {dynamicPieData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function PostModal({ post, companyId, onClose }: { post: SocialContent | null, companyId?: string, onClose: () => void }) {
  const addPost = useAddSocialContent();
  const updatePost = useUpdateSocialContent();
  const deletePost = useDeleteSocialContent();
  const uploadFile = useUploadFile();
  const addTask = useAddTask();

  const [form, setForm] = useState({
    platform: post?.platform || 'Instagram',
    content_type: post?.content_type || 'post',
    caption: post?.caption || '',
    notes: post?.notes || '',
    scheduled_date: post?.scheduled_date ? format(new Date(post?.scheduled_date), "yyyy-MM-dd'T'HH:mm") : '',
    status: post?.status || 'idea'
  });

  const [mediaFiles, setMediaFiles] = useState<string[]>(post?.media_files || []);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;
    setIsUploading(true);
    try {
      const uploadedFile = await uploadFile.mutateAsync({ file, companyId, category: 'media', socialContentId: post?.id });
      setMediaFiles(prev => [...prev, uploadedFile.url]);
      toast.success("Asset integrated successfully.");
    } catch {
      toast.error("Asset integration failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyId) return toast.error("Assign a company node.");
    try {
      const payload = { ...form, media_files: mediaFiles };
      if (post) {
        await updatePost.mutateAsync({ id: post.id, ...payload });
        toast.success("System updated.");
      } else {
        await addPost.mutateAsync({ ...payload, company_id: companyId });
        toast.success("Fragment committed.");
      }
      onClose();
    } catch {
      toast.error("Process failed.");
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await deletePost.mutateAsync(post.id);
      toast.success("Fragment purged.");
      onClose();
    } catch {
      toast.error("Purge aborted.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F1E3D]/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-8 border-b border-gray-50 shrink-0">
          <div>
            <h2 className="text-[20px] font-black text-[#0F1E3D] uppercase tracking-tight">
              {post ? 'Architect Fragment' : 'Draft New Fragment'}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Social Distribution Protocol</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Node</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map(p => (
                  <button key={p.id} type="button" onClick={() => setForm({ ...form, platform: p.id })}
                    className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border text-[11px] font-bold transition-all",
                      form.platform === p.id ? "bg-[#0F1E3D] text-white border-transparent shadow-lg" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300")}>
                    {p.icon} {p.id}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Format Specification</label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map(t => (
                  <button key={t.id} type="button" onClick={() => setForm({ ...form, content_type: t.id })}
                    className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border text-[11px] font-bold transition-all",
                      form.content_type === t.id ? "bg-[#0F1E3D] text-white border-transparent shadow-lg" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300")}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule Date</label>
            <div className="relative group">
               <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
               <input type="datetime-local" value={form.scheduled_date}
                 onChange={e => setForm({ ...form, scheduled_date: e.target.value })}
                 className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-[12px] font-black outline-none focus:border-[#0F1E3D] transition-all" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Message</label>
            <textarea placeholder="Draft your caption blueprint here..." rows={4}
              value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-[28px] p-5 text-[13px] font-bold text-[#0F1E3D] outline-none focus:border-[#0F1E3D] transition-all resize-none" />
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</label>
             <div className="grid grid-cols-3 gap-2">
                {STAGES.map(s => (
                  <button key={s.id} type="button" onClick={() => setForm({ ...form, status: s.id })}
                    className={cn("px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                      form.status === s.id ? "bg-indigo-600 text-white border-transparent shadow-md" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200")}>
                    {s.label}
                  </button>
                ))}
             </div>
          </div>
        </form>

        <div className="p-8 border-t border-gray-50 shrink-0 bg-gray-50/50 flex items-center justify-between">
          <div className="flex gap-3">
            {post && (
              <button type="button" onClick={handleDelete} disabled={isDeleting}
                className="w-14 h-14 rounded-2xl border border-rose-100 bg-white text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                {isDeleting ? <Clock className="w-5 h-5 animate-spin"/> : <Trash2 className="w-6 h-6"/>}
              </button>
            )}
            <div className="flex items-center gap-3">
               <button type="button" disabled={isUploading}
                 className="w-14 h-14 rounded-2xl border border-gray-100 bg-white text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-[#0F1E3D] transition-all shadow-sm relative overflow-hidden group disabled:opacity-50">
                  {isUploading ? <Clock className="w-5 h-5 animate-spin"/> : <Upload className="w-6 h-6 z-10" />}
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               </button>
               <div className="flex -space-x-2 overflow-hidden">
                 {mediaFiles.map((url, i) => (
                   <img key={i} src={url} className="inline-block h-10 w-10 rounded-xl ring-2 ring-white object-cover" />
                 ))}
               </div>
            </div>
          </div>

          <button onClick={() => handleSubmit()}
            disabled={addPost.isPending || updatePost.isPending || isUploading}
            className="px-10 py-5 bg-[#0F1E3D] text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#1e3a8a] transition-all shadow-xl shadow-[#0F1E3D]/10 active:scale-95 disabled:opacity-50">
            {addPost.isPending || updatePost.isPending ? 'Syncing...' : (post ? 'Save Updates' : 'Commit Fragment')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
        active ? "bg-[#0F1E3D] text-white shadow-xl" : "text-gray-300 hover:text-[#0F1E3D]")}>
      {icon} {label}
    </button>
  );
}
