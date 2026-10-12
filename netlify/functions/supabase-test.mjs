export default async function handler() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return Response.json(
      {
        ok: false,
        error: "Supabase environment variables missing"
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/`,
      {
        method: "GET",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`
        }
      }
    );

    return Response.json({
      ok: response.ok,
      status: response.status,
      message: response.ok
        ? "Supabase API reachable"
        : "Supabase responded with an error"
    });
  } catch {
    return Response.json(
      {
        ok: false,
        error: "Could not connect to Supabase"
      },
      { status: 502 }
    );
  }
}
