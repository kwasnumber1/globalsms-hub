import { createClient } from "@supabase/supabase-js";

const countries = {
  US: { name: "United States", number: "+1 202-555-0147" },
  GB: { name: "United Kingdom", number: "+44 7700 900123" },
  PH: { name: "Philippines", number: "+63 905 555 0147" },
  CA: { name: "Canada", number: "+1 416-555-0147" },
  AU: { name: "Australia", number: "+61 490 000 147" }
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return reply(405, { error: "POST request required." });
  }

  try {
    const body = await request.json();
    const selected = countries[body.country];

    if (!selected) {
      return reply(400, { error: "Unsupported country." });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return reply(500, {
        error: "Supabase environment variables are missing."
      });
    }

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("sms_sessions")
      .insert({
        country: body.country,
        phone_number: selected.number,
        status: "demo"
      })
      .select("id, country, phone_number, status, created_at")
      .single();

    if (error) {
      console.error("Database insert failed:", error.message);
      return reply(500, {
        error: "Could not save the demo session."
      });
    }

    return reply(200, {
      ok: true,
      demo: true,
      session: data,
      message: "Demo session saved successfully. This is not a real phone number."
    });
  } catch {
    return reply(400, { error: "Invalid request." });
  }
}

function reply(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
