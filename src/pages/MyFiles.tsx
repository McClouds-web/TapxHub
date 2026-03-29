import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Download, FileText, Image, Film, Archive, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFiles } from "@/hooks/useAppData";
import { format } from "date-fns";

export default function MyFiles() {
  const { user } = useAuth();
  const { data: files = [], isLoading } = useFiles();

  // Filter for client's own deliverables
  const myFiles = files.filter(f => f.company_id === user?.company_id && f.is_deliverable);

  const stats = [
    { label: "Total Files", value: myFiles.length, color: "text-[var(--brand-primary)]" },
    { label: "Design Assets", value: myFiles.filter(f => f.name.match(/\.(png|jpg|jpeg|gif|fig|svg)$/i)).length, color: "text-blue-600" },
    { label: "Documents", value: myFiles.filter(f => f.name.match(/\.(pdf|doc|docx|zip|archive)$/i)).length, color: "text-purple-600" },
    { label: "Videos", value: myFiles.filter(f => f.name.match(/\.(mp4|mov)$/i)).length, color: "text-emerald-600" },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-6 overflow-hidden pb-4">
      
      <motion.div variants={item} className="shrink-0 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Asset Vault</h1>
           <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest flex items-center gap-2">
             <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Secure Agency Deliverables
           </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 block mb-2">{label}</span>
            <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : myFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-5 shadow-sm">
                <FolderOpen className="h-7 w-7 text-[var(--brand-primary)] opacity-20" />
              </div>
              <h3 className="text-xl font-extrabold text-[var(--brand-primary)] mb-2">The vault is quiet</h3>
              <p className="text-sm font-medium text-[var(--brand-primary)]/40 max-w-sm leading-relaxed">
                Your high-resolution assets and project documents will appear here once they are ready for delivery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               <AnimatePresence>
                  {myFiles.map((file) => (
                    <motion.div 
                      key={file.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group bg-white border border-[#0F1E3D]/5 p-4 rounded-2xl hover:shadow-xl hover:bg-blue-50/20 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center group-hover:bg-white transition-colors">
                           {file.name.match(/\.(png|jpg|jpeg|svg)$/i) ? <Image className="w-5 h-5 text-blue-500" /> :
                            file.name.match(/\.(mp4|mov)$/i)? <Film className="w-5 h-5 text-teal-500" /> :
                            <FileText className="w-5 h-5 text-amber-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-black uppercase text-[#0F1E3D] truncate tracking-wide">{file.name}</p>
                          <p className="text-[10px] font-bold text-[#0F1E3D]/40 uppercase mt-0.5">{file.file_size_mb} MB • Deliverable</p>
                          <p className="text-[9px] font-bold text-[#0F1E3D]/20 uppercase mt-1">Ready on {file.created_at ? format(new Date(file.created_at), "MMM d, yyyy") : ''}</p>
                        </div>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center text-[#1E3A8A] hover:bg-[#0F1E3D] hover:text-white transition-all shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
