-- ==========================================
-- TAPXHUB PHASE 4: VECTOR AI SETUP
-- Copy/Paste this file into the Supabase SQL Editor and click "RUN"
-- ==========================================

-- 1. Enable the pgvector extension to support vector embeddings
CREATE EXTENSION IF NOT EXISTS vector
WITH SCHEMA extensions;

-- 2. Create the strategy_documents table to store uploaded PDFs/docs
--    These documents are chunked and linked to specific companies over vector embeddings
CREATE TABLE IF NOT EXISTS public.strategy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content TEXT NOT NULL,
  -- 1536 refers to the dimensions returned by OpenAI embeddings (text-embedding-3-small or text-embedding-ada-002)
  embedding VECTOR(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create a helper function to perform vector similarity matching (RAG)
--    This function is called by the Supabase Edge Function to find relevant info based on user query
CREATE OR REPLACE FUNCTION match_strategy_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_company_id uuid
)
RETURNS TABLE (
  id UUID,
  company_id UUID,
  file_name TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    sd.id,
    sd.company_id,
    sd.file_name,
    sd.content,
    1 - (sd.embedding <=> query_embedding) AS similarity
  FROM strategy_documents sd
  WHERE sd.company_id = p_company_id
  AND 1 - (sd.embedding <=> query_embedding) > match_threshold
  ORDER BY sd.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.strategy_documents ENABLE ROW LEVEL SECURITY;

-- Temporary: Allow anonymous connections for local development 
CREATE POLICY "Allow anon everything on strategy docs" 
  ON public.strategy_documents FOR ALL TO anon USING (true);
