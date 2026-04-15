// TapxHub /src/lib/gemini.ts
import { supabase } from "./supabase";

export async function getChatResponse(userMessage: string, chatHistory: any[], userName: string, contextMode: "onboarding" | "client", companyData: any) {
  try {
    const { data, error } = await supabase.functions.invoke('vector_chat', {
       body: {
          message: userMessage,
          history: chatHistory.map(h => ({
             role: h.role === 'model' ? 'assistant' : 'user',
             content: h.parts?.[0]?.text || h.text || h.content
          })),
          userName,
          contextMode,
          companyData
       }
    });

    if (error) {
       console.error("Critical Edge Function Error:", error);
       // Check for specific common errors
       if (error.message?.includes('404')) return "Neural Link offline: The vector_chat function could not be found. Please check deployment.";
       if (error.message?.includes('401')) return "Neutral Link error: Authorization failed. Check VITE_SUPABASE_ANON_KEY.";
       throw new Error(error.message || "Edge Function failed");
    }

    if (!data?.content) {
        console.warn("Empty response from AI:", data);
        return "I'm currently recalibrating my strategy. Please re-state your question.";
    }

    return data.content;
  } catch (error: any) {
    console.error("AI Service Internal Error:", error);
    return `The neural link experienced an interruption: ${error.message || 'Unknown Network Error'}. Please ensure XAI_API_KEY is set in Supabase Secrets.`;
  }
}
