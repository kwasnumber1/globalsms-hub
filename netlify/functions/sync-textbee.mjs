import { createClient } from "@supabase/supabase-js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json(
      { ok: false, error: "POST request required." },
      { status: 405 }
    );
  }

  const apiKey = process.env.TEXTBEE_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !supabaseUrl || !supabaseKey) {
    return Response.json(
      { ok: false, error: "Server configuration is incomplete." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.textbee.dev/api/v1/gateway/messages?direction=received&limit=20",
      {
        headers: { "x-api-key": apiKey }
      }
    );

    if (!response.ok) {
      console.error("Textbee API status:", response.status);

      return Response.json(
        { ok: false, error: "Textbee API request failed." },
        { status: 502 }
      );
    }

    const result = await response.json();
    const messages = result.data || [];

    const supabase = createClient(supabaseUrl, supabaseKey);

    const rows = messages
      .filter((message) => message._id && message.device?._id)
      .map((message) => ({
        sender: message.from || "Unknown",
        message_body: message.message || "",
        received_at: message.receivedAt || message.createdAt || new Date().toISOString()
      }));

    return Response.json({
      ok: true,
      fetched: messages.length,
      note: "Messages retrieved. Database insertion requires a matching session or message table design."
    });
  } catch (error) {
    console.error("Sync failed:", error.message);

    return Response.json(
      { ok: false, error: "Could not sync messages." },
      { status: 500 }
    );
  }
      }
