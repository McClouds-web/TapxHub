import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Briefcase, Paperclip, MessageSquare, Trash2, Download, Loader2, Layers } from "lucide-react";
import { Task, VaultFile, TaskComment, Project } from "@/hooks/useAppData";
import { useAddTask, useUpdateTask, useDeleteTask, useCompanies, useTaskComments, useAddTaskComment, useUploadFile, useFiles, useProjects } from "@/hooks/useAppData";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: string;
}

export function TaskFormModal({ isOpen, onClose, task, defaultStatus }: TaskFormModalProps) {
  const addTask = useAddTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: companies = [] } = useCompanies();
  const { data: projects = [] } = useProjects();
  
  // Vault & Comments logic
  const { data: allFiles = [] } = useFiles();
  const taskFiles = allFiles.filter(f => f.task_id === task?.id);
  const uploadFile = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: comments = [], isLoading: commentsLoading } = useTaskComments(task?.id);
  const addComment = useAddTaskComment();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [companyId, setCompanyId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedUser, setAssignedUser] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "todo");
      setPriority(task.priority || "medium");
      setCompanyId(task.company_id || "");
      setProjectId(task.project_id || "");
      setAssignedUser(task.assigned_user || "");
      setDueDate(task.due_date || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus(defaultStatus || "todo");
      setPriority("medium");
      setCompanyId("");
      setProjectId("");
      setAssignedUser("");
      setDueDate("");
    }
  }, [task, isOpen, defaultStatus]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const payload = {
      title,
      description,
      status,
      priority,
      company_id: companyId,
      project_id: projectId,
      assigned_user: assignedUser,
      due_date: dueDate,
    };
    try {
      if (task) {
        if (task.status !== status) {
          // Log status change activity
          await addComment.mutateAsync({ taskId: task.id, content: `Moved task to ${status}`, type: 'activity' });
        }
        await updateTask.mutateAsync({ id: task.id, ...payload });
      } else {
        const newTask = await addTask.mutateAsync(payload);
        if (newTask?.id) {
          await addComment.mutateAsync({ taskId: newTask.id, content: `Task created`, type: 'activity' });
        }
      }
      onClose();
    } catch (e) {
      console.error(e);
      onClose();   
    }
  };

  const handleDelete = async () => {
    if (task) {
      await deleteTask.mutateAsync(task.id);
      onClose();
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && task?.id) {
      try {
        await addComment.mutateAsync({ taskId: task.id, content: newComment.trim(), type: 'comment' });
        setNewComment("");
      } catch (e) {
        console.error("Failed to post comment");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && task?.id) {
      const file = e.target.files[0];
      setIsUploading(true);
      try {
        await uploadFile.mutateAsync({ file, taskId: task.id, companyId: companyId || undefined });
        await addComment.mutateAsync({ taskId: task.id, content: `Uploaded file: ${file.name}`, type: 'activity' });
      } catch (e) {
        console.error("Upload failed", e);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F1E3D]/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white w-full max-w-4xl rounded-[32px] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Left Side: Form Controls */}
        <div className="flex-1 flex flex-col max-h-[90vh] border-r border-[#0F1E3D]/5">
          <div className="flex items-center justify-between p-6 border-b border-[#0F1E3D]/5 bg-[#FAFBFC]">
            <h2 className="text-xl font-black text-[#0F1E3D]">{task ? "Edit Task" : "New Task"}</h2>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="p-2 text-[#0F1E3D]/40 bg-white md:hidden rounded-xl border border-[#0F1E3D]/5">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
             <div>
               <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Task Title</label>
               <input 
                 type="text" 
                 value={title} 
                 onChange={e => setTitle(e.target.value)}
                 className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[15px] font-bold text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors"
                 placeholder="What needs to be done?"
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-bold text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors appearance-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="doing">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Priority</label>
                  <select 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                    className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-bold text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
             </div>

             <div>
               <label className="block text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">Description</label>
               <textarea 
                 value={description} 
                 onChange={e => setDescription(e.target.value)}
                 className="w-full h-32 bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-medium text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors resize-none"
                 placeholder="Add technical details, acceptance criteria, or context..."
               />
             </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">
                    <Briefcase className="w-3.5 h-3.5" /> Client
                  </label>
                  <select 
                    value={companyId} 
                    onChange={e => setCompanyId(e.target.value)}
                    className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-bold text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors appearance-none"
                  >
                    <option value="">No Client (Internal)</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="flex items-center gap-2 text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">
                    <Layers className="w-3.5 h-3.5" /> Project
                  </label>
                  <select 
                    value={projectId} 
                    onChange={e => setProjectId(e.target.value)}
                    className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-bold text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors appearance-none"
                  >
                    <option value="">No Project</option>
                    {projects.filter(p => !companyId || p.company_id === companyId).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">
                    <User className="w-3.5 h-3.5" /> Assign To
                  </label>
                  <input 
                    type="text" 
                    value={assignedUser} 
                    onChange={e => setAssignedUser(e.target.value)}
                    className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-bold text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-2">
                    <Calendar className="w-3.5 h-3.5" /> Due Date
                  </label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-2xl px-4 py-3 text-[13px] font-bold text-[#0F1E3D] outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-[#0F1E3D]/5 bg-[#FAFBFC] flex justify-between">
            {task ? (
              <button onClick={handleDelete} className="p-3.5 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            ) : <div />}
            <button 
              disabled={!title}
              onClick={handleSave} 
              className="px-8 py-3.5 bg-[#0F1E3D] hover:bg-[#1a365d] disabled:opacity-50 text-white text-[13px] font-bold tracking-wide rounded-[16px] shadow-md transition-all"
            >
              {task ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </div>

        {/* Right Side: Attachments and Comments (Only enabled if Editing Task) */}
        <div className="w-full md:w-[380px] bg-white flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-6 border-b border-[#0F1E3D]/5">
             <h3 className="text-[13px] font-bold text-[#0F1E3D] uppercase tracking-widest">Vault & Activity</h3>
             <button onClick={onClose} className="p-2 hidden md:block text-[#0F1E3D]/40 hover:text-[#0F1E3D] transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>

          {!task ? (
             <div className="flex flex-col items-center justify-center flex-1 p-6 text-center text-[#0F1E3D]/30">
                <MessageSquare className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-[13px] font-medium max-w-[200px]">Save this task first to unlock file attachments and comments.</p>
             </div>
          ) : (
             <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
               {/* Vault Section */}
               <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest">
                       <Paperclip className="w-3.5 h-3.5" /> Attachments
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} className="text-[11px] font-bold text-[#3b82f6] hover:text-[#2563eb]">
                       + Upload New
                    </button>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                    />
                  </div>
                  
                  {isUploading && (
                     <div className="w-full py-4 bg-[#F4F5F7] rounded-xl flex items-center justify-center gap-2 text-[#0F1E3D]/40 text-[12px] font-bold">
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading to Vault...
                     </div>
                  )}

                  <div className="space-y-2">
                     {taskFiles.length === 0 && !isUploading && (
                        <p className="text-[11px] font-medium text-[#0F1E3D]/30 italic">No files attached.</p>
                     )}
                     {taskFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-xl hover:border-[#0F1E3D]/20 transition-all">
                           <div className="flex-1 truncate pr-2">
                              <p className="text-[12px] font-bold text-[#0F1E3D] truncate">{file.name}</p>
                              <p className="text-[10px] text-[#0F1E3D]/40">{file.file_size_mb} MB</p>
                           </div>
                           <a href={file.url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-lg border border-[#0F1E3D]/5 text-[#3b82f6] hover:bg-[#F4F5F7]">
                              <Download className="w-3.5 h-3.5" />
                           </a>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Activity Stream */}
               <div className="flex-1 flex flex-col min-h-[300px]">
                  <label className="flex items-center gap-2 text-[11px] font-bold text-[#0F1E3D]/40 uppercase tracking-widest mb-4">
                     <MessageSquare className="w-3.5 h-3.5" /> Comments & Activity
                  </label>
                  
                  <div className="flex-1 space-y-4 mb-4">
                     {commentsLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-[#0F1E3D]/20" /></div>
                     ) : comments.length === 0 ? (
                        <p className="text-[11px] text-[#0F1E3D]/40 font-medium italic">No activity recorded yet.</p>
                     ) : (
                        comments.map(c => (
                           <div key={c.id} className={cn("p-4 rounded-2xl text-[12px]", c.type === 'activity' ? "bg-transparent border border-dashed border-[#0F1E3D]/10" : "bg-[#FAFBFC] border border-[#0F1E3D]/5")}>
                              {c.type === 'activity' ? (
                                <p className="font-medium text-[#0F1E3D]/60 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F1E3D]/20" /> {c.content}
                                </p>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between mb-1">
                                     <span className="font-bold text-[#0F1E3D]">{c.user_name}</span>
                                     <span className="text-[10px] text-[#0F1E3D]/30">{c.created_at ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true }) : 'now'}</span>
                                  </div>
                                  <p className="text-[#0F1E3D]/70 font-medium">{c.content}</p>
                                </>
                              )}
                           </div>
                        ))
                     )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                     <input 
                       value={newComment}
                       onChange={e => setNewComment(e.target.value)}
                       onKeyDown={e => e.key === "Enter" && handleAddComment()}
                       placeholder="Write an update..." 
                       className="flex-1 bg-[#FAFBFC] border border-[#0F1E3D]/5 rounded-[14px] px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#3b82f6]"
                     />
                     <button onClick={handleAddComment} disabled={!newComment.trim()} className="px-5 bg-[#3b82f6] disabled:opacity-50 text-white rounded-[14px] text-[12px] font-bold shadow-sm hover:bg-[#2563eb]">
                        Post
                     </button>
                  </div>
               </div>

             </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
