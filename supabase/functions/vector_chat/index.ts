// supabase/functions/vector_chat/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { message, history, userName, companyData } = await req.json()
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

    if (!GROQ_API_KEY) throw new Error("Cloud Error: GROQ_API_KEY missing in secrets")

    const systemPrompt = `You are a world-class growth architect and strategy AI for TapxMedia, a digital marketing agency. The client's name is ${userName || 'Partner'}. ${companyData?.name ? `Their company is ${companyData.name}.` : ''} Be sharp, insightful, and actionable. Keep responses concise and impactful.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((h: any) => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts?.[0]?.text || h.content || ''
      })),
      { role: "user", content: message }
    ]

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Groq Request Failed", data)
      return new Response(JSON.stringify({ error: `Groq failed: ${data.error?.message || response.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const content = data.choices?.[0]?.message?.content || "No response generated."

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error("Function Crash:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
