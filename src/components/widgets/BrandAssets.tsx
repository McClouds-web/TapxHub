import React, { useState, useEffect, useRef } from 'react';
import { Palette, Download, ExternalLink, Image as ImageIcon, Type, Upload, Trash2, Loader2, File as FileIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listBrandAssets, uploadBrandAsset, deleteBrandAsset, getBrandAssetUrl } from '@/lib/storage';
import { toast } from 'sonner';

export const BrandAssets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = user?.role === 'admin';

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const data = await listBrandAssets();
      setAssets(data || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
      toast.error('Could not load brand assets. Have you created the bucket?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      await uploadBrandAsset(file);
      toast.success('Asset uploaded successfully');
      await fetchAssets();
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
        await deleteBrandAsset(fileName);
        toast.success('Asset deleted');
        await fetchAssets();
    } catch (error) {
        toast.error('Failed to delete asset');
    }
  };

  const handleDownload = async (fileName: string) => {
    const url = getBrandAssetUrl(fileName);
    window.open(url, '_blank', 'noreferrer');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string) => {
     return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const formatFileName = (filename: string) => {
     // Remove timestamp prefix if exists (e.g., 17112345_originalname.png -> originalname.png)
     const parts = filename.split('_');
     if (parts.length > 1 && !isNaN(Number(parts[0]))) {
         parts.shift();
     }
     return parts.join('_');
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="glass-card p-3 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
           <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]">Identity Vault</h3>
              <p className="text-[10px] text-[#0F1E3D]/40 font-bold uppercase tracking-widest">Brand Growth Infrastructure</p>
           </div>
           <Palette className="w-5 h-5 text-rose-500" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
           <div className="p-3 bg-white border border-[#0F1E3D]/5 rounded-xl">
              <span className="text-[10px] font-black uppercase text-[#0F1E3D]/40 block mb-2">Primary Palette</span>
              <div className="flex gap-2">
                 <div className="w-8 h-8 rounded-lg bg-[#0F1E3D] shadow-sm" />
                 <div className="w-8 h-8 rounded-lg bg-[#1E3A8A] shadow-sm" />
                 <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#0F1E3D]/10" />
              </div>
           </div>
           <div className="p-3 bg-white border border-[#0F1E3D]/5 rounded-xl">
              <span className="text-[10px] font-black uppercase text-[#0F1E3D]/40 block mb-2">Typography</span>
              <div className="flex items-center gap-2">
                 <Type className="w-4 h-4 text-[#0F1E3D]/30" />
                 <span className="text-[10px] font-black text-[#0F1E3D]">DM Sans</span>
              </div>
           </div>
        </div>

        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black uppercase text-[#0F1E3D]/80">Available Assets</span>
           {isAdmin && (
             <div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button 
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0F1E3D] text-white rounded-lg text-[10px] uppercase font-black tracking-widest hover:bg-[#1E3A8A] transition-all disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {isUploading ? 'Uploading...' : 'Upload Asset'}
                </button>
             </div>
           )}
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto min-h-[150px] pr-2">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2 py-4">
                <Loader2 className="w-6 h-6 animate-spin text-[#1E3A8A]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/60">Syncing Vault...</span>
             </div>
           ) : assets.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2 border-2 text-center border-dashed border-[#0F1E3D]/10 rounded-xl py-4">
                <FileIcon className="w-6 h-6 text-[#1E3A8A]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0F1E3D]/60 max-w-[200px]">No assets found. Upload a file or check bucket RLS policies.</span>
             </div>
           ) : (
             assets.map((asset, i) => (
               <div key={asset.id || i} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#0F1E3D]/5 rounded-xl group transition-all hover:bg-white hover:border-blue-500/20">
                  <div className="flex items-center gap-3 overflow-hidden">
                     <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-[#0F1E3D]/5 shrink-0">
                        <ImageIcon className="w-4 h-4 text-[#0F1E3D]/40" />
                     </div>
                     <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-[#0F1E3D] block truncate">{formatFileName(asset.name)}</span>
                        <span className="text-[10px] font-bold text-[#0F1E3D]/30 uppercase">{getFileExtension(asset.name)} • {formatFileSize(asset.metadata?.size || 0)}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                     {isAdmin && (
                       <button 
                          onClick={() => handleDelete(asset.name)}
                          className="p-2 bg-white text-rose-500/50 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-all border border-rose-500/10"
                       >
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                     )}
                     <button 
                        onClick={() => handleDownload(asset.name)}
                        className="p-2 bg-white text-[#0F1E3D]/30 rounded-lg hover:text-[#0F1E3D] transition-all border border-[#0F1E3D]/5 focus:outline-none"
                     >
                        <Download className="w-3.5 h-3.5" />
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};
