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

  let body;

  try {
    body = await request.json();
  } catch {
    return reply(400, { error: "Invalid JSON." });
  }

  const selected = countries[body.country];

  if (!selected) {
    return reply(400, { error: "Unsupported country." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return reply(500, {
      error: "Supabase environment variables are missing."
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const sessionToken = crypto.randomUUID();

  const { data, error } = await supabase
    .from("sms_sessions")
    .insert({
      session_token: sessionToken,
      country: body.country,
      phone_number: selected.number,
      status: "demo"
    })
    .select("id, session_token, country, phone_number, status, created_at")
    .single();

  if (error) {
    console.error("Supabase insert failed:", error.message);

    return reply(500, {
      error: "Could not save demo session."
    });
  }

  return reply(200, {
    session: {
      id: data.id,
      token: data.session_token,
      country: data.country,
      countryName: selected.name,
      phoneNumber: data.phone_number,
      createdAt: data.created_at,
      demo: true
    },
    messages: [],
    message: "Demo session saved. No real phone number or SMS is provided."
  });
}

function reply(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
