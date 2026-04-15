import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, Clock, Instagram, 
  Facebook, Twitter, Linkedin, Youtube, 
  MessageSquare, ChevronRight, Image as ImageIcon,
  FileVideo, Layers, Zap, AlertCircle, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  useSocialContent, 
  useUpdateSocialContent, 
  useAddNotification,
  useCompanies,
  useAddTask,
  type SocialContent 
} from '@/hooks/useAppData';

export function SocialApproval({ companyId }: { companyId: string }) {
  const { data: content = [], isLoading } = useSocialContent(companyId);
  const updateContent = useUpdateSocialContent();
  const addNotification = useAddNotification();
  const addTask = useAddTask();
  const { data: companies = [] } = useCompanies();

  const company = companies.find(c => c.id === companyId);

  const pendingContent = content.filter(item => item.status === 'in_review');

  const handleApprove = async (id: string) => {
    const item = content.find(i => i.id === id);
    if (!item) return;

    try {
      await updateContent.mutateAsync({ 
        id, 
        status: 'approved', 
        approval_status: 'approved',
        notes: "Approved by client." 
      });
      
      // Notify Admin
      await addNotification.mutateAsync({
        user_id: 'admin-id', // The system will route this to all admins via RLS or role logic if possible, 
        // but here we just need to insert it. The notifications hook usually has its own logic.
        title: "Content Approved",
        message: `${company?.name || 'A client'} just approved a social media fragment.`,
        type: 'deliverable_ready',
        related_company_id: companyId
      });

      // Create Task for Admin
      await addTask.mutateAsync({
        company_id: companyId,
        title: `Publish Social Fragment: ${item.platform}`,
        description: `Content approved by client. Ready for publishing orchestration.\n\nCaption: ${item.caption}`,
        status: 'todo',
        priority: 'high',
        is_internal: true
      });

      toast.success("Content approved! Marked for scheduling.");
    } catch {
      toast.error("Approval failed.");
    }
  };

  const handleRevision = async (id: string, currentNotes: string) => {
    const reason = prompt("Please provide feedback for the revision:", "");
    if (!reason) return;

    try {
      await updateContent.mutateAsync({ 
        id, 
        status: 'draft', 
        approval_status: 'revision_requested',
        notes: `${currentNotes || ''}\n\n[Revision Requested]: ${reason}` 
      });

      // Notify Admin
      await addNotification.mutateAsync({
        user_id: 'admin-id',
        title: "Revision Requested",
        message: `${company?.name || 'A client'} requested a revision on a social media fragment.`,
        type: 'deliverable_ready',
        related_company_id: companyId
      });

      toast.info("Revision requested. The agency has been notified.");
    } catch {
      toast.error("Process failed.");
    }
  };

  if (isLoading) return <div className="h-48 flex items-center justify-center"><Clock className="animate-spin text-gray-300"/></div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[14px] font-black uppercase tracking-tight text-[#0F1E3D]">Strategy Approvals</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {pendingContent.length} fragments awaiting your signal
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100 italic text-[9px] font-bold text-indigo-600">
           Agency Status: Active Generation
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingContent.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
             <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mb-3"/>
             <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Pipeline Clean</p>
             <p className="text-[9px] font-bold text-gray-200 uppercase mt-1">No pending content for review</p>
          </div>
        ) : (
          pendingContent.map(item => (
            <ApprovalCard 
              key={item.id} 
              item={item} 
              onApprove={() => handleApprove(item.id)}
              onRevision={() => handleRevision(item.id, item.notes || '')}
            />
          ))
        )}
      </div>

      {content.some(item => ['approved', 'scheduled', 'published'].includes(item.status)) && (
        <div className="mt-4 pt-4 border-t border-gray-100">
           <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Confirmed Fragments</h4>
           <div className="flex flex-wrap gap-2">
             {content.filter(item => ['approved', 'scheduled', 'published'].includes(item.status)).map(item => (
               <div key={item.id} className="px-3 py-2 bg-white border border-gray-100 rounded-xl flex items-center gap-3 shadow-sm group hover:border-indigo-100 transition-all">
                  <div className="w-6 h-6 rounded-lg bg-[#0F1E3D] flex items-center justify-center text-white text-[9px] font-black">
                    {item.platform[0]}
                  </div>
                  <span className="text-[10px] font-bold text-[#0F1E3D]">{item.status}</span>
                  <Check className="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ item, onApprove, onRevision }: { 
  item: SocialContent, 
  onApprove: () => void, 
  onRevision: () => void 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-[28px] overflow-hidden flex flex-col shadow-sm group hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
    >
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-xl bg-[#0F1E3D] flex items-center justify-center text-white shadow-lg">
                <Instagram className="w-4 h-4"/>
             </div>
             <div>
                <span className="text-[10px] font-black uppercase tracking-tight text-[#0F1E3D]">{item.platform}</span>
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-none mt-1">{item.content_type}</p>
             </div>
           </div>
           <div className="text-[9px] font-bold text-[#3b82f6] bg-blue-50 px-2 py-1 rounded-full uppercase tracking-widest border border-blue-100">
             Draft Coordinate: {item.scheduled_date ? format(new Date(item.scheduled_date), 'MMM d, h:mm a') : 'Unset'}
           </div>
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 italic text-[12px] font-bold text-[#0F1E3D] leading-relaxed relative">
           <span className="absolute -top-2 -left-2 text-indigo-500 opacity-20 text-4xl font-serif">"</span>
           {item.caption || "Strategic fragment awaiting caption blueprint."}
        </div>

        {item.media_files && item.media_files.length > 0 && (
           <div className="grid grid-cols-2 gap-2 h-32">
              {item.media_files.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                   <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                </div>
              ))}
           </div>
        )}
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-50 grid grid-cols-2 gap-3">
         <button 
          onClick={onRevision}
          className="py-3 px-4 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center gap-2"
         >
           <XCircle className="w-4 h-4"/> Request Revision
         </button>
         <button 
          onClick={onApprove}
          className="py-3 px-4 bg-[#0F1E3D] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-[#0F1E3D]/10 flex items-center justify-center gap-2"
         >
           <CheckCircle2 className="w-4 h-4"/> Approve Signal
         </button>
      </div>
    </motion.div>
  );
}
