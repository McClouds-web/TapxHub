/**
 * useRealtimeSync — re-exports the canonical implementation from useAppData.
 *
 * The single global Supabase channel is owned by useAppData.ts.
 * This file exists only for backwards-compatible imports.
 */
export { useRealtimeSync } from "@/hooks/useAppData";
