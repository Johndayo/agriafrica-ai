import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// JWT verification helper
// ---------------------------------------------------------------------------
function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

// ---------------------------------------------------------------------------
// POST /chat — Streams a Gemini response as SSE to the client
// ---------------------------------------------------------------------------
serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- 1. Verify caller JWT ---
    const token = getBearerToken(req);
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 2. Parse request body ---
    const { conversation_id, messages } = await req.json();

    if (!conversation_id || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "conversation_id and messages[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 3. Verify conversation ownership via service-role client ---
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: conversation, error: convError } = await admin
      .from("conversations")
      .select("id, user_id")
      .eq("id", conversation_id)
      .single();

    if (convError || !conversation || conversation.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 4. Persist the user message ---
    const lastUserMsg = messages[messages.length - 1];
    const { error: insertUserErr } = await admin.from("messages").insert({
      conversation_id,
      user_id: user.id,
      role: "user",
      content: lastUserMsg.content,
    });

    if (insertUserErr) {
      console.error("Failed to insert user message:", insertUserErr);
      return new Response(JSON.stringify({ error: "Failed to record message" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 5. Build Gemini request payload ---
    const systemPrompt = Deno.env.get("GEMINI_SYSTEM_PROMPT") ?? "You are AgriAfrica AI, an agricultural assistant.";

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiPayload = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
    };

    // --- 6. Stream response from Gemini ---
    const geminiRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": Deno.env.get("GEMINI_API_KEY")!,
      },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 7. Transform SSE stream and forward to client ---
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Collect full response for DB persistence
    let fullResponse = "";

    (async () => {
      const reader = geminiRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE lines from Gemini
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                fullResponse += text;
                await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {
              // Skip malformed SSE chunks
            }
          }
        }

        // Signal stream completion
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (streamErr) {
        console.error("Stream read error:", streamErr);
      } finally {
        await writer.close();
      }
    })();

    // --- 8. Persist assistant reply asynchronously (non-blocking) ---
    if (fullResponse) {
      admin.from("messages").insert({
        conversation_id,
        user_id: user.id,
        role: "assistant",
        content: fullResponse,
        tokens_used: Math.ceil(fullResponse.length / 4), // rough estimate
      }).then(({ error }) => {
        if (error) console.error("Failed to persist assistant reply:", error);
      });
    }

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Unhandled chat error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
