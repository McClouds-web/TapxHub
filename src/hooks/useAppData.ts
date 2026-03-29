/**
 * useAppData — Central data layer for TapxHub
 *
 * All components read from these shared React Query caches.
 * A single Supabase real-time channel invalidates the right
 * query whenever any row changes, so every component updates
 * in sync automatically.
 */

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  status: string;          // 'todo' | 'doing' | 'done'
  priority?: string;       // 'high' | 'medium' | 'low'
  start_date?: string;
  due_date?: string;
  company_name?: string;
  is_personal?: boolean;
  created_at?: string;
}

export interface Invoice {
  id: string;
  company_id?: string;
  invoice_number: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date?: string;
  items?: { description: string; amount: number }[];
  invoice_url?: string;
  pdf_generated?: boolean;
  created_at?: string;
}

export interface Company {
  id: string;
  name: string;
  monthly_amount?: number;
  retainer_amount?: number;
  retainer_status?: string; // 'in_progress' | 'completed' | 'delivered'
  client_type?: string;     // 'invoice' | 'retainer'
  contact_email?: string;
  email?: string;
  phone?: string;
  location?: string;
  site?: string;
  contact_name?: string;
  industry?: string;
  start_date?: string;
  status?: string;
  kpi_embed_url?: string;
  business_profile?: any;
  onboarding_completed?: boolean;
  meta_ad_account_id?: string;
  google_property_id?: string;
  sync_enabled?: boolean;
}

export interface Meeting {
  id: string;
  user_id: string;
  company_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  is_personal: boolean;
  created_at: string;
}

export interface ClientReport {
  id: string;
  company_id: string;
  report_month: string;
  reach: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  spend: number;
  revenue: number;
  synced_at: string;
}

export interface Notification {
  id: string;
  is_read: boolean;
  message?: string;
  title?: string;
  type?: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferred_date?: string;
  preferred_time?: string;
  service_interest?: string;
  message?: string;
  status: string; // 'pending' | 'confirmed' | 'cancelled' | 'converted'
  source?: string;
  company_id?: string;
  created_at?: string;
}

export interface VaultFile {
  id: string;
  name: string;
  url: string;
  storage_provider?: string;
  file_size_mb?: number;
  category?: string;
  company_id?: string;
  company_name?: string;
  uploaded_by?: string;
  is_deliverable?: boolean;
  created_at?: string;
}

export interface Conversation {
  id: string;
  company_id: string;
  company_name?: string;
  subject?: string;
  last_message_at?: string;
  created_at?: string;
  unread_count?: number;
  last_message?: string;
}

export interface ServiceMetric {
  id: string;
  company_id: string;
  service_id: string;
  metric_name: string;
  metric_value: string;
  trend?: string;
  updated_at?: string;
}

export interface SocialWorkflow {
  id: string;
  company_id: string;
  current_stage: 'strategy' | 'planning' | 'creation' | 'approval' | 'publishing' | 'tracking' | 'optimization';
  content_index?: number;
  status?: string;
  updated_at?: string;
}

export interface AdminInsight {
  id: string;
  company_id?: string;
  client_health: {
    id: string;
    name: string;
    sentiment: number;
    status: 'stable' | 'growth' | 'at-risk';
    opportunity: string;
  }[];
  opportunities: {
    title: string;
    description: string;
    probability: string;
    value: string;
  }[];
  updated_at?: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: 'admin' | 'client';
  content: string;
  is_read: boolean;
  created_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  role: string;
  company_id?: string;
  full_name?: string;
  phone_number?: string;
  telegram_chat_id?: string;
  ntfy_topic?: string;
  notification_preferences?: {
    email: boolean;
    telegram: boolean;
    ntfy: boolean;
    gmail: boolean;
  };
  created_at?: string;
  revenue_pulse_kpi?: string;
  active_roadmap_status?: Record<string, 'locked' | 'implementing' | 'active'>;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export function useBookings() {
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useAddBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Omit<Booking, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("bookings")
        .insert([booking])
        .select()
        .single();
      if (error) throw error;
      return data as Booking;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useConvertBookingToClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      booking,
      companyName,
      clientType,
    }: {
      booking: Booking;
      companyName: string;
      clientType: "invoice" | "retainer";
    }) => {
      // 1. Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([{
          name: companyName,
          contact_email: booking.email,
          client_type: clientType,
        }])
        .select()
        .single();
      if (companyError) throw companyError;

      // 2. Mark booking as converted
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({ status: "converted", company_id: company.id })
        .eq("id", booking.id);
      if (bookingError) throw bookingError;

      // 3. Create notification
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("notifications").insert([{
          user_id: user.id,
          title: "New Client Added",
          message: `${companyName} has been converted from a booking to a client.`,
          type: "new_client",
          related_company_id: company.id,
        }]);
      }

      return company;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ─── Conversations & Messages ─────────────────────────────────────────────────

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", authUser?.id).single();
      
      let query = supabase
        .from("conversations")
        .select(`
          *,
          companies(name)
        `);

      if (profile?.role !== "admin" && profile?.company_id) {
        query = query.eq("company_id", profile.company_id);
      }

      const { data, error } = await query.order("last_message_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((c: any) => ({
        ...c,
        company_name: c.companies?.name ?? "Unknown",
      }));
    },
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery<ConversationMessage[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!conversationId,
  });
}

export function useSendConversationMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      senderId,
      senderRole,
      content,
    }: {
      conversationId: string;
      senderId: string;
      senderRole: "admin" | "client";
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("messages")
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          sender_role: senderRole,
          content,
          is_read: false,
        }])
        .select()
        .single();
      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, role }: { conversationId: string; role: "admin" | "client" }) => {
      // Mark messages sent by the OTHER role as read
      const otherRole = role === "admin" ? "client" : "admin";
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("sender_role", otherRole)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, subject }: { companyId: string; subject?: string }) => {
      const { data, error } = await supabase
        .from("conversations")
        .insert([{ company_id: companyId, subject }])
        .select(`*, companies(name)`)
        .single();
      if (error) throw error;
      return { ...data, company_name: data.companies?.name ?? "Unknown" } as Conversation;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useUnreadMessageCount() {
  return useQuery<number>({
    queryKey: ["unread_messages"],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", authUser?.id).single();

      let query = supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);

      if (profile?.role === "admin") {
        query = query.eq("sender_role", "client");
      } else {
        // For client: count messages from admin in their own conversations
        const { data: convIds } = await supabase.from("conversations").select("id").eq("company_id", profile?.company_id);
        const ids = (convIds ?? []).map(c => c.id);
        if (ids.length === 0) return 0;
        query = query.eq("sender_role", "admin").in("conversation_id", ids);
      }

      const { count, error } = await query;
      if (error) return 0;
      return count ?? 0;
    },
    staleTime: 15_000,
    initialData: 0,
  });
}

// Keep old useMessages/useSendMessage for backwards compatibility
export function useMessages() {
  return useConversations();
}

export function useSendMessage() {
  return useSendConversationMessage();
}

// ─── Files (Vault) ────────────────────────────────────────────────────────────

export function useFiles(companyId?: string) {
  return useQuery<VaultFile[]>({
    queryKey: ["files", companyId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("files")
        .select(`*, companies(name)`)
        .order("created_at", { ascending: false });
      if (companyId) query = query.eq("company_id", companyId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((f: any) => ({
        ...f,
        company_name: f.companies?.name,
      }));
    },
    staleTime: 30_000,
    initialData: [],
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      companyId,
      category,
    }: {
      file: File;
      companyId?: string;
      category?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${companyId ?? "general"}/${Date.now()}_${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("vault")
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;

      // Get public/signed URL
      const { data: urlData } = supabase.storage
        .from("vault")
        .getPublicUrl(path);

      // Insert record into files table
      const { data, error } = await supabase
        .from("files")
        .insert([{
          name: file.name,
          url: urlData.publicUrl,
          storage_provider: "supabase",
          file_size_mb: parseFloat((file.size / 1024 / 1024).toFixed(2)),
          category: category ?? "general",
          company_id: companyId ?? null,
          uploaded_by: user?.id ?? null,
          is_deliverable: false,
        }])
        .select()
        .single();
      if (error) throw error;
      return data as VaultFile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from("files")
        .delete()
        .eq("id", fileId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });
}

// ─── Companies (CRUD) ─────────────────────────────────────────────────────────

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
    initialData: [],
  });
}

export function useAddCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (company: {
      name: string;
      contact_email?: string;
      client_type?: string;
      retainer_amount?: number;
      kpi_embed_url?: string;
      drive_link?: string;
      business_profile?: any;
      onboarding_completed?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("companies")
        .insert([company])
        .select()
        .single();
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const { error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, ...updates }) => {
      await qc.cancelQueries({ queryKey: ["companies"] });
      const prev = qc.getQueryData<Company[]>(["companies"]);
      qc.setQueryData<Company[]>(["companies"], (old = []) =>
        old.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["companies"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

export function useUpdateRetainerStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      retainer_status,
    }: {
      id: string;
      retainer_status: string;
    }) => {
      const { error } = await supabase
        .from("companies")
        .update({ retainer_status })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, retainer_status }) => {
      await qc.cancelQueries({ queryKey: ["companies"] });
      const prev = qc.getQueryData<Company[]>(["companies"]);
      qc.setQueryData<Company[]>(["companies"], (old = []) =>
        old.map((c) => (c.id === id ? { ...c, retainer_status } : c))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["companies"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["companies"] }),
  });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function useTasks() {
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", authUser?.id).single();
      const { data: company } = profile?.company_id ? await supabase.from("companies").select("name").eq("id", profile.company_id).single() : { data: null };

      let query = supabase
        .from("tasks")
        .select("*");

      if (profile?.role !== "admin" && profile?.company_id) {
        // Look for company_name matches or company_id matches
        query = query.or(`company_id.eq.${profile.company_id},company_name.eq.${company?.name || '___NON_EXISTENT___'}`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
    initialData: [],
  });
}

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: {
      title: string;
      status?: string;
      priority?: string;
      start_date?: string;
      due_date?: string;
      company_name?: string;
      is_personal?: boolean;
    }) => {
      const payload = { status: "todo", priority: "medium", ...task };
      const { data, error } = await supabase
        .from("tasks")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onMutate: async (newTask) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      const optimistic: Task = {
        id: `temp-${Date.now()}`,
        title: newTask.title,
        status: newTask.status ?? "todo",
        priority: newTask.priority ?? "medium",
        due_date: newTask.due_date,
        company_name: newTask.company_name,
        is_personal: newTask.is_personal,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<Task[]>(["tasks"], (old = []) => [optimistic, ...old]);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, status } : t))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useActiveTaskCount() {
  const { data: tasks } = useTasks();
  return (tasks ?? []).filter((t) => t.status === "todo" || t.status === "doing").length;
}

export function useTodayTaskCount() {
  const { data: tasks } = useTasks();
  const today = format(new Date(), "yyyy-MM-dd");
  return (tasks ?? []).filter(
    (t) =>
      t.status !== "done" &&
      t.due_date &&
      t.due_date.startsWith(today)
  ).length;
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", authUser?.id).single();

      let query = supabase
        .from("invoices")
        .select("*");

      if (profile?.role !== "admin" && profile?.company_id) {
        query = query.eq("company_id", profile.company_id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
    initialData: [],
  });
}

export function usePendingInvoiceCount() {
  const { data: invoices } = useInvoices();
  return (invoices ?? []).filter((i) => i.status === "sent").length;
}

export function useAddInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Partial<Invoice>) => {
      const { data, error } = await supabase
        .from("invoices")
        .insert([invoice])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
    initialData: [],
  });
}

export function useUnreadNotificationCount() {
  const { data: notifications } = useNotifications();
  return (notifications ?? []).filter((n) => !n.is_read).length;
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── Real-time Sync ──────────────────────────────────────────────────────────

export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("tapxhub_global")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" },
        () => qc.invalidateQueries({ queryKey: ["tasks"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "invoices" },
        () => qc.invalidateQueries({ queryKey: ["invoices"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "companies" },
        () => qc.invalidateQueries({ queryKey: ["companies"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" },
        () => qc.invalidateQueries({ queryKey: ["notifications"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" },
        () => qc.invalidateQueries({ queryKey: ["bookings"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" },
        () => qc.invalidateQueries({ queryKey: ["conversations"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" },
        () => {
          qc.invalidateQueries({ queryKey: ["messages"] });
          qc.invalidateQueries({ queryKey: ["conversations"] });
          qc.invalidateQueries({ queryKey: ["unread_messages"] });
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "files" },
        () => qc.invalidateQueries({ queryKey: ["files"] }))
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("🟢 TapxHub Real-time Synced!");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}

export function useReports(companyId?: string) {
  const { data: reports, isLoading, error } = useQuery<ClientReport[]>({
    queryKey: ["reports", companyId],
    queryFn: async () => {
      let query = supabase
        .from("client_reports")
        .select("*")
        .order("report_month", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { data: reports, isLoading, error };
}

// ─── Meetings ──────────────────────────────────────────────────────────────

export function useMeetings() {
  return useQuery<Meeting[]>({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useAddMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (meeting: Partial<Meeting>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("meetings")
        .insert([{ ...meeting, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings"] }),
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Meeting> & { id: string }) => {
      const { error } = await supabase
        .from("meetings")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings"] }),
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

// ─── Phase 2: Ultimate Growth OS Hooks ────────────────────────────────────────

export function useServiceMetrics(companyId?: string, serviceId?: string) {
  return useQuery<ServiceMetric[]>({
    queryKey: ["service_metrics", companyId, serviceId],
    queryFn: async () => {
      let query = supabase.from("service_metrics").select("*");
      if (companyId) query = query.eq("company_id", companyId);
      if (serviceId) query = query.eq("service_id", serviceId);
      const { data, error } = await query.order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
  });
}

export function useSocialWorkflow(companyId: string) {
  return useQuery<SocialWorkflow | null>({
    queryKey: ["social_workflow", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_workflows")
        .select("*")
        .eq("company_id", companyId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!companyId,
  });
}

export function useAdminInsights(companyId?: string) {
  return useQuery<AdminInsight[]>({
    queryKey: ["admin_insights", companyId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("admin_insights").select("*");
      if (companyId) query = query.eq("company_id", companyId);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}
