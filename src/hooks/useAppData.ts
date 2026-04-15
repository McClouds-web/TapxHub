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
  description?: string;
  status: string;          // 'todo' | 'doing' | 'review' | 'done'
  priority?: string;       // 'high' | 'medium' | 'low'
  start_date?: string;
  due_date?: string;
  company_name?: string;
  company_id?: string;
  project_id?: string;
  assigned_user?: string;
  is_personal?: boolean;
  created_at?: string;
}

export interface Invoice {
  id: string;
  company_id?: string;
  invoice_number: string;
  amount: number;           // always stored in USD
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date?: string;
  items?: { description: string; amount: number }[];
  invoice_url?: string;
  pdf_generated?: boolean;
  // BWP / multi-currency fields
  currency?: 'USD' | 'BWP';
  exchange_rate?: number;   // local-currency-per-USD, e.g. 13.5
  vat_rate?: number;        // 0.14 = 14 %
  vat_amount?: number;      // calculated VAT in local currency
  lead_id?: string;
  manual_client_name?: string;
  manual_client_email?: string;
  manual_client_phone?: string;
  manual_company_name?: string;
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
  brand_voice?: string;
  brand_tone?: string;
  brand_keywords?: string[];
  target_audience?: string;
  brand_description?: string;
  brand_values?: string;
  meta_ad_account_id?: string;
  google_property_id?: string;
  sync_enabled?: boolean;
  health_score?: number;
  lifetime_value?: number;
  last_interaction_at?: string;
  mrr?: number;
  logo_url?: string;
  created_at?: string;
}

export interface ServicePerformance {
  id: string;
  service_type: string;
  revenue_generated: number;
  cost_estimate: number;
  profit_estimate: number;
  performance_score: number;
  active_clients_count: number;
}

export interface RevenueMetric {
  id: string;
  month: string;
  total_mrr: number;
  total_revenue_collected: number;
  new_clients_count: number;
  churn_rate: number;
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

export interface ActivityLog {
  id: string;
  company_id: string;
  user_id?: string;
  event_type: string;
  description: string;
  metadata?: any;
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
  task_id?: string;
  uploaded_by?: string;
  is_deliverable?: boolean;
  created_at?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name?: string;
  content: string;
  type?: 'comment' | 'activity';
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
  avatar_url?: string;
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
      taskId,
      socialContentId,
    }: {
      file: File;
      companyId?: string;
      category?: string;
      taskId?: string;
      socialContentId?: string;
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
          task_id: taskId ?? null,
          social_content_id: socialContentId ?? null,
          uploaded_by: user?.id ?? null,
          is_deliverable: false,
        }])
        .select()
        .single();
      if (error) throw error;
      return data as VaultFile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"], exact: false }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"], exact: false }),
  });
}

export function useMarkFileDelivered() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, isDeliverable }: { fileId: string; isDeliverable: boolean }) => {
      const { error } = await supabase
        .from("files")
        .update({ is_deliverable: isDeliverable })
        .eq("id", fileId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"], exact: false }),
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

export function useActivateClientSystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ companyId, onboardingData }: { companyId: string; onboardingData: any }) => {
      const { data, error } = await supabase.rpc("activate_client_system", {
        p_company_id: companyId,
        p_onboarding_data: onboardingData
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
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
      company_id?: string;
      project_id?: string;
      company_name?: string;
      is_internal?: boolean;
      is_personal?: boolean;
    }) => {
      const payload = { status: "todo", priority: "medium", is_internal: false, ...task };
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

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, ...updates }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
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
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old = []) => old.filter((t) => t.id !== id));
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

// ─── Task Comments & Activity ────────────────────────────────────────────────

export function useTaskComments(taskId: string | undefined) {
  return useQuery<TaskComment[]>({
    queryKey: ["task_comments", taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from("task_comments")
        .select("*, profiles!task_comments_user_id_fkey(full_name, email)")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      return (data ?? []).map((c: any) => ({
        ...c,
        user_name: c.profiles?.full_name || c.profiles?.email || 'Unknown User'
      }));
    },
    enabled: !!taskId,
  });
}

export function useAddTaskComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, content, type = 'comment' }: { taskId: string; content: string; type?: 'comment' | 'activity' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("task_comments")
        .insert([{
          task_id: taskId,
          user_id: user.id,
          content,
          type
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["task_comments", vars.taskId] });
    },
  });
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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", authUser.id)
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
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", authUser.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useAddNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      user_id?: string;
      title: string;
      message: string;
      type: string;
      related_company_id?: string;
    }) => {
      let targetUserId = payload.user_id;
      if (!targetUserId || targetUserId === 'admin-id') {
        const { data: { user } } = await supabase.auth.getUser();
        targetUserId = user?.id;
      }

      const { data, error } = await supabase
        .from("notifications")
        .insert([{
          user_id: targetUserId,
          title: payload.title,
          message: payload.message,
          type: payload.type,
          related_company_id: payload.related_company_id,
          is_read: false
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
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
        (payload) => {
          // Target the specific conversation thread for instant update
          const newRecord = payload.new as any;
          if (newRecord?.conversation_id) {
            qc.invalidateQueries({ queryKey: ["messages", newRecord.conversation_id] });
          } else {
            qc.invalidateQueries({ queryKey: ["messages"], exact: false });
          }
          qc.invalidateQueries({ queryKey: ["conversations"] });
          qc.invalidateQueries({ queryKey: ["unread_messages"] });
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "files" },
        // Use exact:false to bust both ["files","all"] and ["files", companyId] keys
        () => qc.invalidateQueries({ queryKey: ["files"], exact: false }))
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" },
        () => qc.invalidateQueries({ queryKey: ["leads"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "social_content" },
        () => qc.invalidateQueries({ queryKey: ["social_content"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "brand_outputs" },
        () => qc.invalidateQueries({ queryKey: ["brand_outputs"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" },
        () => qc.invalidateQueries({ queryKey: ["activity_logs"], exact: false }))
      .on("postgres_changes", { event: "*", schema: "public", table: "service_performance" },
        () => qc.invalidateQueries({ queryKey: ["service_performance"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "revenue_metrics" },
        () => qc.invalidateQueries({ queryKey: ["revenue_metrics"] }))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}

export function useClientReports(companyId?: string) {
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

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  company_id?: string;
  company_name?: string;
  service?: string;
  status: "active" | "review" | "completed";
  progress?: number;
  due_date?: string;
  created_at?: string;
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
    initialData: [],
  });
}

export function useAddProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: {
      title: string;
      company_id?: string;
      service?: string;
      status?: string;
      due_date?: string;
    }) => {
      const payload = { status: "active", progress: 0, ...project };
      const { data, error } = await supabase
        .from("projects")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { error } = await supabase.from("projects").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  company_id?: string;
  company_name?: string;
  report_type?: string;
  month?: string;
  status: "draft" | "approved" | "sent";
  content?: any;
  created_at?: string;
}

export function useReports(companyId?: string) {
  return useQuery<Report[]>({
    queryKey: ["reports", companyId ?? "all"],
    queryFn: async () => {
      let query = supabase.from("client_reports").select("*");
      if (companyId) query = query.eq("company_id", companyId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
    initialData: [],
  });
}

export function useAddReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: {
      company_id: string;
      company_name?: string;
      report_type?: string;
      month?: string;
      status?: string;
      content?: any;
    }) => {
      const payload = { status: "draft", month: format(new Date(), "yyyy-MM"), ...report };
      const { data, error } = await supabase
        .from("client_reports")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data as Report;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

// ─── Stripe Checkout ──────────────────────────────────────────────────────────

export interface CheckoutSession {
  url: string;
  session_id: string;
}

/**
 * Invokes the stripe_checkout Edge Function.
 * Returns the Stripe-hosted Checkout Session URL to redirect the client to.
 */
export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (payload: {
      invoice_id: string;
      invoice_number: string;
      amount: number;
      customer_email?: string;
    }): Promise<CheckoutSession> => {
      const { data, error } = await supabase.functions.invoke<CheckoutSession>(
        "stripe_checkout",
        { body: payload }
      );
      if (error) throw new Error(error.message);
      if (!data?.url) throw new Error("No checkout URL returned from Stripe.");
      return data;
    },
  });
}

// ─── Social Posts ─────────────────────────────────────────────────────────────

export interface SocialPost {
  id: string;
  company_id: string;
  title: string;
  type: string;       // 'Carousel' | 'Reel' | 'Thread' | 'Story' | 'Post'
  platform: string;   // 'Instagram' | 'TikTok' | 'X / LinkedIn' | etc.
  image_url?: string;
  caption?: string;
  status: "pending" | "approved" | "revision" | "published";
  admin_notes?: string;
  scheduled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SocialContent {
  id: string;
  company_id: string;
  project_id?: string;
  platform: string;
  content_type: string;
  caption?: string;
  media_files?: string[];
  status: 'idea' | 'draft' | 'in_review' | 'approved' | 'scheduled' | 'published';
  approval_status: 'pending' | 'approved' | 'revision_requested';
  scheduled_date?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface BrandOutput {
  id: string;
  company_id: string;
  content_type: string;
  persona_mode: string;
  prompt: string;
  output_text: string;
  is_saved_to_vault: boolean;
  created_at: string;
  created_by?: string;
}

export function useSocialPosts(companyId: string) {
  return useQuery<SocialPost[]>({
    queryKey: ["social_posts", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!companyId,
    staleTime: 30_000,
    initialData: [],
  });
}

export function useUpdatePostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      admin_notes,
    }: {
      id: string;
      status: SocialPost["status"];
      admin_notes?: string;
    }) => {
      const { error } = await supabase
        .from("social_posts")
        .update({ status, admin_notes, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    // Optimistic update so the UI flips instantly
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["social_posts"] });
      const keys = qc
        .getQueryCache()
        .findAll({ queryKey: ["social_posts"] })
        .map((q) => q.queryKey);
      const snapshots: Record<string, SocialPost[]> = {};
      for (const key of keys) {
        const prev = qc.getQueryData<SocialPost[]>(key);
        if (prev) {
          snapshots[JSON.stringify(key)] = prev;
          qc.setQueryData<SocialPost[]>(
            key,
            prev.map((p) => (p.id === id ? { ...p, status } : p))
          );
        }
      }
      return { snapshots };
    },
    onError: (_e, _v, ctx) => {
      if (!ctx) return;
      for (const [keyStr, prev] of Object.entries(ctx.snapshots)) {
        qc.setQueryData(JSON.parse(keyStr), prev);
      }
    },
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: ["social_posts"] });
    },
  });
}

// ─── Sales Rhythm: Leads ─────────────────────────────────────────────────────

export interface Lead {
  id: string;
  business_name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
  location?: string;
  lead_source?: string;
  pipeline_stage: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  notes?: string;
  created_at?: string;
}

export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
    initialData: [],
  });
}

export function useAddLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lead: Omit<Lead, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("leads")
        .insert([{ ...lead, status: lead.status ?? "New" }])
        .select()
        .single();
      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Lead> & { id: string }) => {
      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

// ─── Sales Rhythm: Scraping Sessions ─────────────────────────────────────────

export interface ScrapingSession {
  id: string;
  location: string;
  keyword: string;
  frequency: "MWF" | "Daily" | "Weekly";
  status: "active" | "paused";
  last_run?: string;
  next_run?: string;
  created_at: string;
}

export function useScrapingSessions() {
  return useQuery<ScrapingSession[]>({
    queryKey: ["scraping_sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scraping_sessions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
    initialData: [],
  });
}

export function useAddScrapingSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      session: Omit<ScrapingSession, "id" | "created_at" | "last_run">
    ) => {
      const { data, error } = await supabase
        .from("scraping_sessions")
        .insert([session])
        .select()
        .single();
      if (error) throw error;
      return data as ScrapingSession;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scraping_sessions"] }),
  });
}

export function useUpdateScrapingSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<ScrapingSession> & { id: string }) => {
      const { error } = await supabase
        .from("scraping_sessions")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scraping_sessions"] }),
  });
}

export function useDeleteScrapingSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scraping_sessions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scraping_sessions"] }),
  });
}

// ─── Social Content Hooks ───────────────────────────────────────────────────

export function useSocialContent(companyId?: string) {
  return useQuery<SocialContent[]>({
    queryKey: ["social_content", companyId],
    queryFn: async () => {
      let query = supabase
        .from("social_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
    initialData: [],
  });
}

export function useAddSocialContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SocialContent>) => {
      const { data, error } = await supabase
        .from("social_content")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data as SocialContent;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social_content"] }),
  });
}

export function useUpdateSocialContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SocialContent> & { id: string }) => {
      const { id, ...updates } = payload;
      const { data, error } = await supabase
        .from("social_content")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as SocialContent;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social_content"] }),
  });
}

export function useDeleteSocialContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["social_content"] }),
  });
}


// ─── Brand Brain Hooks ──────────────────────────────────────────────────────

export function useBrandOutputs(companyId?: string) {
  return useQuery<BrandOutput[]>({
    queryKey: ["brand_outputs", companyId],
    queryFn: async () => {
      let query = supabase
        .from("brand_outputs")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });
}

export function useAddBrandOutput() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BrandOutput>) => {
      const { data, error } = await supabase
        .from("brand_outputs")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data as BrandOutput;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["brand_outputs"] }),
  });
}

export function useUpdateCompanyBrandProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Company> & { id: string }) => {
      const { id, ...updates } = payload;
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── Automation Hooks ───────────────────────────────────────────────────────

export function useActivityLogs(companyId?: string) {
  return useQuery<ActivityLog[]>({
    queryKey: ["activity_logs", companyId],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10_000,
  });
}

export function useAddActivityLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<ActivityLog>) => {
      const { data, error } = await supabase
        .from("activity_logs")
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data as ActivityLog;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activity_logs"] }),
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId, adminId }: { leadId: string; adminId: string }) => {
      const { data, error } = await supabase
        .rpc("convert_lead_to_client", { p_lead_id: leadId, p_admin_id: adminId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
}

// ─── Executive Intelligence Hooks ──────────────────────────────────────────

export function useServicePerformance() {
  return useQuery<ServicePerformance[]>({
    queryKey: ["service_performance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_performance")
        .select("*")
        .order("revenue_generated", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useRevenueMetrics() {
  return useQuery<RevenueMetric[]>({
    queryKey: ["revenue_metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_metrics")
        .select("*")
        .order("month", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });
}

export function useRecalculateHealth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (companyId: string) => {
      const { data, error } = await supabase
        .rpc("recalculate_client_health", { p_company_id: companyId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
