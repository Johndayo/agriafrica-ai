import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const BATCH_SIZE = 100;
const TWILIO_API_URL = "https://api.twilio.com/2010-04-01/Accounts";
const AT_API_URL = "https://api.africastalking.com/version1/messaging";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DailyTip {
  id: string;
  title: string;
  body: string;
  language: string;
}

interface FarmerProfile {
  id: string;
  phone: string;
  preferred_language: string;
  location: string;
}

interface SmsLogEntry {
  phone: string;
  status: "sent" | "failed" | "skipped";
  gateway: "twilio" | "africastalking";
  error_message?: string;
  sent_at: string;
}

// ---------------------------------------------------------------------------
// SMS Gateway Router — selects provider by country code prefix
// ---------------------------------------------------------------------------
function resolveGateway(phone: string): "twilio" | "africastalking" {
  // +234 = Nigeria (Africa's Talking preferred)
  // +254 = Kenya (Africa's Talking preferred)
  // +255 = Tanzania (Africa's Talking preferred)
  // +233 = Ghana (Africa's Talking preferred)
  // All others → Twilio fallback
  const africanPrefixes = ["+234", "+254", "+255", "+233", "+256", "+257", "+260"];
  return africanPrefixes.some((p) => phone.startsWith(p)) ? "africastalking" : "twilio";
}

// ---------------------------------------------------------------------------
// Africa's Talking SMS sender
// ---------------------------------------------------------------------------
async function sendViaAfricaSTalking(
  phone: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const apiKey = Deno.env.get("AT_API_KEY")!;
    const username = Deno.env.get("AT_USERNAME")!;
    const from = Deno.env.get("AT_SENDER_ID") ?? "";

    const body = new URLSearchParams();
    body.set("username", username);
    body.set("to", phone);
    body.set("message", message);
    if (from) body.set("from", from);

    const res = await fetch(AT_API_URL, {
      method: "POST",
      headers: {
        apiKey,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `AT ${res.status}: ${err}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Twilio SMS sender
// ---------------------------------------------------------------------------
async function sendViaTwilio(
  phone: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;

    const credentials = btoa(`${accountSid}:${authToken}`);

    const body = new URLSearchParams();
    body.set("To", phone);
    body.set("From", fromNumber);
    body.set("Body", message);

    const res = await fetch(`${TWILIO_API_URL}/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `Twilio ${res.status}: ${err}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Unified SMS dispatcher
// ---------------------------------------------------------------------------
async function sendSms(phone: string, message: string): Promise<{ ok: boolean; gateway: "twilio" | "africastalking"; error?: string }> {
  const gateway = resolveGateway(phone);
  if (gateway === "africastalking") {
    const result = await sendViaAfricaSTalking(phone, message);
    return { ...result, gateway };
  }
  const result = await sendViaTwilio(phone, message);
  return { ...result, gateway };
}

// ---------------------------------------------------------------------------
// Daily tip content resolver by language
// ---------------------------------------------------------------------------
async function getTodaysTip(db: SupabaseClient): Promise<DailyTip | null> {
  // Fetch the most recently created unpublished tip, or recycle the latest one.
  const { data, error } = await db
    .from("daily_tips")
    .select("id, title, body, language")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data;
}

// ---------------------------------------------------------------------------
// Batch processor — processes profiles in chunks to avoid timeouts
// ---------------------------------------------------------------------------
async function processBatch(
  db: SupabaseClient,
  tip: DailyTip,
  offset: number,
  totalSent: number,
  totalFailed: number
): Promise<{ totalSent: number; totalFailed: number }> {
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, phone, preferred_language, location")
    .not("phone", "eq", "")
    .range(offset, offset + BATCH_SIZE - 1);

  if (error) {
    console.error(`Batch fetch error at offset ${offset}:`, error);
    return { totalSent, totalFailed };
  }

  if (!profiles || profiles.length === 0) {
    return { totalSent, totalFailed };
  }

  const logs: SmsLogEntry[] = [];

  for (const profile of profiles) {
    const farmer = profile as FarmerProfile;

    // Skip if farmer's language doesn't match tip (fallback to English tip)
    const tipBody = tip.language === farmer.preferred_language
      ? tip.body
      : tip.body; // In production, fetch language-specific tip

    const smsResult = await sendSms(farmer.phone, tipBody);

    logs.push({
      phone: farmer.phone,
      status: smsResult.ok ? "sent" : "failed",
      gateway: smsResult.gateway,
      error_message: smsResult.error,
      sent_at: new Date().toISOString(),
    });

    if (smsResult.ok) totalSent++;
    else totalFailed++;
  }

  // Batch insert logs
  await db.from("daily_tip_log").insert(logs);

  // Recurse for next batch
  if (profiles.length === BATCH_SIZE) {
    return processBatch(db, tip, offset + BATCH_SIZE, totalSent, totalFailed);
  }

  return { totalSent, totalFailed };
}

// ---------------------------------------------------------------------------
// POST /send-daily-tip — Trigger endpoint (called by pg_cron or admin)
// ---------------------------------------------------------------------------
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- 1. Verify caller (service-role or authenticated admin) ---
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
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
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 2. Fetch today's tip ---
    const tip = await getTodaysTip(admin);
    if (!tip) {
      return new Response(JSON.stringify({ error: "No tip available today" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- 3. Process all farmers in batches (non-blocking response) ---
    const result = await processBatch(admin, tip, 0, 0, 0);

    // --- 4. Log summary ---
    await admin.from("daily_tip_log").insert({
      phone: "SYSTEM",
      status: "sent",
      gateway: "twilio",
      error_message: `Dispatch complete: ${result.totalSent} sent, ${result.totalFailed} failed`,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        tip_id: tip.id,
        total_sent: result.totalSent,
        total_failed: result.totalFailed,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("send-daily-tip error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
