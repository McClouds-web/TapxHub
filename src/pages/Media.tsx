import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, File, Video, Download, Search, 
  UploadCloud, Plus, X, Loader2, Sparkles, Filter, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useFiles, useUploadFile, useDeleteFile, useCompanies } from "@/hooks/useAppData";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Media() {
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    
    const { data: files = [], isLoading: filesLoading } = useFiles();
    const { data: companies = [] } = useCompanies();
    
    const uploadFile = useUploadFile();
    const deleteFile = useDeleteFile();

    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploadForm, setUploadForm] = useState({
        file: null as File | null,
        company_id: "",
        is_deliverable: true
    });

    const filteredFiles = files.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
        const isOwner = isAdmin || f.company_id === user?.company_id;
        return matchesSearch && isOwner;
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setUploadForm(prev => ({ ...prev, file: e.target.files![0] }));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadForm.file || !uploadForm.company_id) {
            toast.error("Please select both a file and a client.");
            return;
        }

        try {
            await uploadFile.mutateAsync({
                file: uploadForm.file,
                companyId: uploadForm.company_id,
                isDeliverable: uploadForm.is_deliverable
            });
            toast.success("File securely uploaded to vault");
            setIsUploading(false);
            setUploadForm({ file: null, company_id: "", is_deliverable: true });
        } catch (err) {
            toast.error("Cloud upload failed. Check connection.");
        }
    };

    const handleDelete = async (id: string, url: string) => {
        if (confirm("Permanently delete this file from the cloud?")) {
            await deleteFile.mutateAsync({ id, url });
            toast.info("File removed from vault");
        }
    };

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
    const item = { hidden: { opacity: 0, scale: 0.9, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } } };

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 pb-12 overflow-x-hidden">
            <motion.div variants={item} className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#0F1E3D] lg:text-4xl flex items-center gap-2">
                        Digital Vault <Sparkles className="w-6 h-6 text-blue-500" />
                    </h1>
                    <p className="text-sm text-[#0F1E3D]/50 font-bold uppercase tracking-widest mt-1">
                        Secure Asset Management & Deliverables
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0F1E3D]/30 group-focus-within:text-[#1E3A8A] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search assets..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-white border border-[#0F1E3D]/5 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-[#0F1E3D] focus:outline-none focus:border-[#1E3A8A] focus:shadow-md transition-all w-64 shadow-sm"
                        />
                    </div>
                    {isAdmin && (
                        <Button 
                            onClick={() => setIsUploading(!isUploading)}
                            className={cn(
                                "rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                                isUploading ? "bg-white text-[#0F1E3D] border border-[#0F1E3D]/10" : "bg-[#0F1E3D] text-white hover:bg-[#1E3A8A]"
                            )}
                        >
                            {isUploading ? <><X className="h-4 w-4 mr-1.5" /> Close</> : <><UploadCloud className="h-4 w-4 mr-1.5" /> Upload</>}
                        </Button>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isUploading && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <form onSubmit={handleUpload} className="bg-white border border-[#0F1E3D]/5 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-6 items-end">
                            <div className="flex-1 w-full space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/40 ml-2">Secure File</label>
                                    <div className="relative border-2 border-dashed border-[#0F1E3D]/10 bg-[#F8FAFC] rounded-2xl p-4 flex items-center justify-center group hover:border-[#1E3A8A]/30 transition-all cursor-pointer">
                                        <input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        <div className="flex flex-col items-center gap-1.5 py-4">
                                            <UploadCloud className="w-8 h-8 text-[#0F1E3D]/20 group-hover:text-[#1E3A8A] transition-colors" />
                                            <span className="text-xs font-bold text-[#0F1E3D]/60">{uploadForm.file ? uploadForm.file.name : "Drop file here or browse"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-64 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-[#0F1E3D]/40 ml-2">Assign to Client</label>
                                    <select 
                                        className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3.5 text-xs font-bold text-[#0F1E3D] focus:outline-none focus:border-[#1E3A8A] transition-all"
                                        value={uploadForm.company_id}
                                        onChange={e => setUploadForm({ ...uploadForm, company_id: e.target.value })}
                                    >
                                        <option value="">Select client...</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={uploadFile.isPending}
                                className="w-full md:w-auto px-8 py-4 bg-[#0F1E3D] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#1E3A8A] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploadFile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Finalize Upload</>}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div variants={container} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                    {filteredFiles.map((file) => (
                        <motion.div
                            key={file.id}
                            layout
                            variants={item}
                            whileHover={{ y: -8 }}
                            className="bg-white group flex flex-col p-5 rounded-[2rem] border border-[#0F1E3D]/5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="mb-4 flex flex-1 items-center justify-center rounded-[1.5rem] bg-[#F8FAFC] p-10 transition-all duration-500 group-hover:bg-blue-50/50 group-hover:rotate-1 border border-[#0F1E3D]/5">
                                {file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? <ImageIcon className="h-10 w-10 text-[#0F1E3D]/20 group-hover:text-blue-500 transition-colors" /> :
                                 file.name.match(/\.(mp4|mov)$/i) ? <Video className="h-10 w-10 text-[#0F1E3D]/20 group-hover:text-teal-500 transition-colors" /> :
                                 <File className="h-10 w-10 text-[#0F1E3D]/20 group-hover:text-amber-500 transition-colors" />}
                            </div>

                            <div className="flex items-start justify-between gap-2 px-1">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-black text-[#0F1E3D] leading-tight group-hover:text-[#1E3A8A] transition-colors uppercase tracking-wider">
                                        {file.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[9px] font-black uppercase text-[#0F1E3D]/40 tracking-widest px-2 py-0.5 bg-[#F8FAFC] rounded-lg border border-[#0F1E3D]/5">
                                            {file.file_size_mb} MB
                                        </span>
                                        <span className="text-[9px] font-bold text-[#0F1E3D]/30 uppercase tracking-tight">
                                            {file.created_at ? format(new Date(file.created_at), "MMM d, yyyy") : ''}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <div className="mt-2.5 flex items-center justify-between">
                                            <span className="text-[9px] font-black text-blue-600/60 uppercase tracking-tighter">
                                                {companies.find(c => c.id === file.company_id)?.name || 'Private'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                    <a 
                                        href={file.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="rounded-xl p-2.5 bg-[#F8FAFC] text-[#0F1E3D]/40 hover:bg-[#0F1E3D] hover:text-white transition-all shadow-sm border border-[#0F1E3D]/5"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </a>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => handleDelete(file.id, file.url)}
                                            className="rounded-xl p-2.5 bg-[#F8FAFC] text-rose-500/40 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-[#0F1E3D]/5"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    
                    {filteredFiles.length === 0 && !filesLoading && (
                         <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-20">
                             <File className="w-16 h-16 mb-4" />
                             <p className="font-black uppercase tracking-[0.2em] text-sm">No Assets Found</p>
                         </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
