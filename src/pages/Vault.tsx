import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderLock, Upload, FileText, Image, Film, Archive,
  File, Search, Download, MoreHorizontal, ShieldCheck, X, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFiles, useUploadFile, useDeleteFile, useCompanies } from "@/hooks/useAppData";
import { supabase } from "@/lib/supabase";

type Category = "all" | "contracts" | "brand" | "reports" | "media" | "general";

const categories: { key: Category; label: string }[] = [
  { key: "all",       label: "All Files" },
  { key: "contracts", label: "Contracts" },
  { key: "brand",     label: "Brand Assets" },
  { key: "reports",   label: "Reports" },
  { key: "media",     label: "Media" },
  { key: "general",   label: "General" },
];

function getFileType(name: string): "pdf" | "image" | "video" | "archive" | "doc" {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext ?? "")) return "image";
  if (["mp4", "mov", "avi", "webm"].includes(ext ?? "")) return "video";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext ?? "")) return "archive";
  return "doc";
}

const typeIcon: Record<string, React.ElementType> = {
  pdf:     FileText,
  image:   Image,
  video:   Film,
  archive: Archive,
  doc:     File,
};

const typeColor: Record<string, string> = {
  pdf:     "text-rose-500 bg-rose-500/10",
  image:   "text-blue-500 bg-blue-500/10",
  video:   "text-purple-500 bg-purple-500/10",
  archive: "text-amber-500 bg-amber-500/10",
  doc:     "text-slate-500 bg-slate-500/10",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Vault() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<Category>("general");
  const [uploadCompanyId, setUploadCompanyId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files = [], isLoading } = useFiles();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const { data: companies = [] } = useCompanies();

  const visible = files.filter((f) => {
    const matchCat = activeCategory === "all" || (f.category ?? "general") === activeCategory;
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.company_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalFiles = files.length;
  const secureFiles = files.filter((f) => f.is_deliverable).length;
  const totalStorageMB = files.reduce((sum, f) => sum + (f.file_size_mb ?? 0), 0);
  const storageLabel = totalStorageMB >= 1000
    ? `${(totalStorageMB / 1024).toFixed(1)} GB`
    : `${Math.round(totalStorageMB)} MB`;

  async function handleUpload() {
    if (!selectedFile) return;
    await uploadFile.mutateAsync({
      file: selectedFile,
      companyId: uploadCompanyId || undefined,
      category: uploadCategory,
    });
    setShowUpload(false);
    setSelectedFile(null);
    setUploadCompanyId("");
    setUploadCategory("general");
  }

  async function handleDownload(file: { url: string; name: string }) {
    // If stored in Supabase storage, get a signed URL
    if (file.url.includes("supabase")) {
      // Extract path from URL
      const urlParts = file.url.split("/vault/");
      if (urlParts[1]) {
        const { data } = await supabase.storage
          .from("vault")
          .createSignedUrl(urlParts[1], 60);
        if (data?.signedUrl) {
          const a = document.createElement("a");
          a.href = data.signedUrl;
          a.download = file.name;
          a.click();
          return;
        }
      }
    }
    // Fallback: direct link
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    a.target = "_blank";
    a.click();
  }

  function formatSize(mb?: number) {
    if (!mb) return "—";
    if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`;
    if (mb < 1) return `${Math.round(mb * 1024)} KB`;
    return `${mb.toFixed(1)} MB`;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="flex flex-col h-full gap-6 overflow-hidden pb-4">

      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between shrink-0 relative z-20">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--brand-primary)]">Vault</h1>
          <p className="text-sm text-[var(--brand-primary)]/50 font-bold mt-1.5 uppercase tracking-widest">
            Secure Document Storage
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F1E3D] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md active:scale-95"
        >
          <Upload className="h-4 w-4 text-white/70" /> Upload File
        </button>
      </motion.div>

      {/* Metric cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]/40 mb-3">Total Files</span>
          <span className="text-3xl font-extrabold text-[var(--brand-primary)] tracking-tight">{totalFiles}</span>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-3">Deliverables</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{secureFiles}</span>
            <ShieldCheck className="h-5 w-5 text-emerald-500 mb-1" />
          </div>
        </div>
        <div className="bg-white border border-[#0F1E3D]/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E3A8A]/5 rounded-bl-[100px] pointer-events-none" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1E3A8A]/70 mb-3">Storage Used</span>
          <span className="text-3xl font-extrabold text-[#1E3A8A] tracking-tight">{storageLabel}</span>
        </div>
      </motion.div>

      {/* File browser */}
      <motion.div variants={item} className="flex-1 min-h-0 bg-white border border-[#0F1E3D]/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F1E3D]/5 shrink-0 bg-[#F8FAFC]/50 gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <FolderLock className="h-4 w-4 text-[#1E3A8A]" />
            <span className="text-sm font-black uppercase tracking-widest text-[var(--brand-primary)]">Files</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((c) => (
                <button key={c.key} onClick={() => setActiveCategory(c.key)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all",
                    activeCategory === c.key
                      ? "bg-[#0F1E3D] text-white border-[#0F1E3D]"
                      : "bg-white text-[var(--brand-primary)]/50 border-[#0F1E3D]/10 hover:border-[#0F1E3D]/20 hover:text-[var(--brand-primary)]"
                  )}>
                  {c.label}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--brand-primary)]/30 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files…"
                className="w-44 bg-white border border-[#0F1E3D]/10 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-[var(--brand-primary)] placeholder:text-[#0F1E3D]/30 focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table head */}
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-6 py-2.5 border-b border-[#0F1E3D]/5 bg-[#F8FAFC]/30 shrink-0">
          <div className="w-9" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30">Name</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30 hidden md:block">Client</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30 hidden sm:block">Size</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]/30 w-16 text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-[#F8FAFC] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <FolderLock className="h-8 w-8 text-[var(--brand-primary)] opacity-20 mb-3" />
              <p className="text-sm font-bold text-[var(--brand-primary)]">
                {files.length === 0 ? "No files uploaded yet." : "No files match your search."}
              </p>
              {files.length === 0 && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="mt-3 px-4 py-2 bg-[#0F1E3D] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all"
                >
                  Upload First File
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              <AnimatePresence>
                {visible.map((file, i) => {
                  const fileType = getFileType(file.name);
                  const Icon = typeIcon[fileType];
                  const uploadDate = file.created_at
                    ? new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—";
                  return (
                    <motion.div key={file.id} layout
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center p-3 rounded-xl border border-transparent hover:border-[#0F1E3D]/5 hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                    >
                      {/* Icon */}
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", typeColor[fileType])}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Name */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[var(--brand-primary)] truncate">{file.name}</p>
                          {file.is_deliverable && (
                            <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]/30 mt-0.5">{uploadDate}</p>
                      </div>

                      {/* Client */}
                      <span className="hidden md:block text-xs font-bold text-[var(--brand-primary)]/40 truncate max-w-[120px]">
                        {file.company_name ?? "—"}
                      </span>

                      {/* Size */}
                      <span className="hidden sm:block text-xs font-bold text-[var(--brand-primary)]/50 tabular-nums w-16 text-right">
                        {formatSize(file.file_size_mb)}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-1 w-16 justify-end relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--brand-primary)]/30 hover:bg-white hover:text-[var(--brand-primary)] hover:shadow-sm border border-transparent hover:border-[#0F1E3D]/10 transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === file.id ? null : file.id); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--brand-primary)]/30 hover:bg-white hover:text-[var(--brand-primary)] hover:shadow-sm border border-transparent hover:border-[#0F1E3D]/10 transition-all"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        {/* Dropdown menu */}
                        <AnimatePresence>
                          {openMenuId === file.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              className="absolute right-0 top-8 z-10 bg-white border border-[#0F1E3D]/10 rounded-xl shadow-lg py-1 w-36"
                            >
                              <button
                                onClick={() => { handleDownload(file); setOpenMenuId(null); }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-[var(--brand-primary)] hover:bg-[#F8FAFC] transition-colors"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${file.name}"?`)) {
                                    deleteFile.mutate(file.id);
                                  }
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#0F1E3D]/5"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--brand-primary)]">Upload File</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--brand-primary)]/40 mt-0.5">Add to Vault</p>
                </div>
                <button onClick={() => setShowUpload(false)} className="p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                  <X className="h-4 w-4 text-[var(--brand-primary)]/40" />
                </button>
              </div>

              <div className="space-y-4">
                {/* File picker */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">
                    File *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
                      selectedFile
                        ? "border-[#1E3A8A]/30 bg-[#1E3A8A]/5"
                        : "border-[#0F1E3D]/10 hover:border-[#0F1E3D]/20 hover:bg-[#F8FAFC]"
                    )}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="h-4 w-4 text-[#1E3A8A]" />
                        <span className="text-sm font-bold text-[#1E3A8A] truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-[var(--brand-primary)]/30 mx-auto mb-2" />
                        <p className="text-xs font-bold text-[var(--brand-primary)]/50">Click to select a file</p>
                        <p className="text-[10px] text-[var(--brand-primary)]/30 mt-0.5">PDF, images, videos, archives up to 50MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as Category)}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  >
                    {categories.filter(c => c.key !== "all").map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Client */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]/50 mb-1.5 block">
                    Client (optional)
                  </label>
                  <select
                    value={uploadCompanyId}
                    onChange={(e) => setUploadCompanyId(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#0F1E3D]/10 rounded-xl px-4 py-3 text-sm font-bold text-[var(--brand-primary)] focus:outline-none focus:border-[var(--brand-accent)] transition-colors"
                  >
                    <option value="">No specific client</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 px-4 py-3 bg-[#F8FAFC] text-[var(--brand-primary)] rounded-xl text-xs font-black uppercase tracking-widest border border-[#0F1E3D]/10 hover:bg-[#F1F5F9] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadFile.isPending}
                  className="flex-1 px-4 py-3 bg-[#0F1E3D] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#1E3A8A] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadFile.isPending ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-3 w-3" /> Upload</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {openMenuId && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenuId(null)} />
      )}
    </motion.div>
  );
}
