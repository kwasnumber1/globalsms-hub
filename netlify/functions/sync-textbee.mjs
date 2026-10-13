import { createClient } from "@supabase/supabase-js";

export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json(
      { ok: false, error: "POST request required." },
      { status: 405 }
    );
  }

  // Protect this endpoint with a private token.
  const expectedToken = process.env.SYNC_SECRET;
  const auth = request.headers.get("authorization");

  if (!expectedToken || auth !== `Bearer ${expectedToken}`) {
    return Response.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey || !deviceId || !supabaseUrl || !supabaseKey) {
    return Response.json(
      { ok: false, error: "Server configuration is incomplete." },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      "https://api.textbee.dev/api/v1/gateway/messages"
    );

    url.searchParams.set("deviceId", deviceId);
    url.searchParams.set("direction", "received");
    url.searchParams.set("limit", "20");

    const response = await fetch(url, {
      headers: { "x-api-key": apiKey }
    });

    if (!response.ok) {
      console.error("Textbee API status:", response.status);
      return Response.json(
        { ok: false, error: "Textbee API request failed." },
        { status: 502 }
      );
    }

    const result = await response.json();
    const messages = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.messages)
        ? result.messages
        : [];

    const supabase = createClient(supabaseUrl, supabaseKey);

    let saved = 0;

    for (const message of messages) {
      const externalId = message._id || message.id;
      const body = message.message || message.text || "";
      const sender = message.from || message.sender || "Unknown";

      if (!externalId || !body) continue;

      const { error } = await supabase
        .from("sms_messages")
        .upsert(
          {
            external_message_id: String(externalId),
            sender: String(sender),
            message_body: String(body),
            received_at:
              message.receivedAt ||
              message.createdAt ||
              new Date().toISOString()
          },
          { onConflict: "external_message_id" }
        );

      if (error) {
        console.error("Supabase save failed:", error.message);
        return Response.json(
          { ok: false, error: "Could not save messages." },
          { status: 500 }
        );
      }

      saved++;
    }

    return Response.json({
      ok: true,
      fetched: messages.length,
      saved
    });
  } catch (error) {
    console.error("Sync error:", error.message);
    return Response.json(
      { ok: false, error: "Sync failed." },
      { status: 500 }
    );
  }
}
