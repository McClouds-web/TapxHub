import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Download, FileText, Image, Film, Archive, Sparkles, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFiles } from "@/hooks/useAppData";
import { format } from "date-fns";
import { useUploadFile, useCompanies } from "@/hooks/useAppData";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function MyFiles() {
  const { user } = useAuth();
  const { data: files = [], isLoading } = useFiles();
  const uploadFile = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"deliverables" | "uploads">("deliverables");

  const myFiles = files.filter(f => f.company_id === user?.company_id);
  const deliverables = myFiles.filter(f => f.is_deliverable);
  const clientUploads = myFiles.filter(f => !f.is_deliverable);

  const displayedFiles = activeTab === "deliverables" ? deliverables : clientUploads;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user?.company_id) {
      try {
        await uploadFile.mutateAsync({
          file: e.target.files[0],
          companyId: user.company_id,
          category: "general"
        });
        toast.success("File uploaded to Vault.");
        setActiveTab("uploads");
      } catch {
        toast.error("Upload failed.");
      }
    }
  };

  const stats = [
    { label: "Agency Assets", value: deliverables.length, color: "text-[var(--brand-primary)]" },
    { label: "Client Uploads", value: clientUploads.length, color: "text-blue-600" },
    { label: "Storage", value: `${myFiles.reduce((acc, f) => acc + (f.file_size_mb || 0), 0).toFixed(1)} MB`, color: "text-amber-600" },
    { label: "Active Phase", value: "Strategic Map", color: "text-indigo-600" },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-4 overflow-hidden pb-4">
      
      <motion.div variants={item} className="shrink-0 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Asset Vault</h1>
           <p className="text-[10px] text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest flex items-center gap-2">
             <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Secure Agency Deliverables
           </p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-4 py-2 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all flex items-center gap-2 shadow-lg"
           >
             {uploadFile.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderOpen className="w-3.5 h-3.5" />}
             Upload context
           </button>
           <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        </div>
      </motion.div>

      <motion.div variants={item} className="flex gap-1 bg-[#F8FAFC] border border-[#0F1E3D]/5 p-1 rounded-xl w-fit">
         <button onClick={() => setActiveTab("deliverables")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "deliverables" ? "bg-white text-[#0F1E3D] shadow-sm" : "text-[#0F1E3D]/30")}>Deliverables</button>
         <button onClick={() => setActiveTab("uploads")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeTab === "uploads" ? "bg-white text-[#0F1E3D] shadow-sm" : "text-[#0F1E3D]/30")}>Your Uploads</button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#0F1E3D]/5 rounded-xl p-3 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 block mb-2">{label}</span>
            <span className={`text-[13px] font-extrabold ${color}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto no-scrollbar p-3">
          {isLoading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : displayedFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-xl bg-[#F8FAFC] border border-[#0F1E3D]/5 flex items-center justify-center mb-5 shadow-sm">
                <FolderOpen className="h-7 w-7 text-[var(--brand-primary)] opacity-20" />
              </div>
              <h3 className="text-[12px] font-extrabold text-[var(--brand-primary)] mb-2">The vault is quiet</h3>
              <p className="text-[10px] font-medium text-[var(--brand-primary)]/40 max-w-sm leading-relaxed">
                Your high-resolution assets and project documents will appear here once they are ready for delivery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               <AnimatePresence>
                  {displayedFiles.map((file) => (
                    <motion.div 
                      key={file.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group bg-white border border-[#0F1E3D]/5 p-3 rounded-xl hover:shadow-xl hover:bg-blue-50/20 transition-all cursor-pointer relative overflow-hidden"
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
                          <p className="text-[10px] font-bold text-[#0F1E3D]/20 uppercase mt-1">Ready on {file.created_at ? format(new Date(file.created_at), "MMM d, yyyy") : ''}</p>
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
