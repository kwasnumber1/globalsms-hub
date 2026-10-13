export default async function handler(request) {
  if (request.method !== "GET") {
    return Response.json(
      { ok: false, error: "GET request required." },
      { status: 405 }
    );
  }

  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;

  if (!apiKey || !deviceId) {
    return Response.json(
      { ok: false, error: "Textbee environment variables are missing." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.textbee.dev/api/v1/gateway/devices/${encodeURIComponent(deviceId)}/messages`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey
        }
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Textbee request failed:", response.status);

      return Response.json(
        {
          ok: false,
          error: "Textbee API request failed.",
          status: response.status
        },
        { status: 502 }
      );
    }

    return Response.json({
      ok: true,
      messages: result
    });
  } catch (error) {
    console.error("Textbee connection error:", error.message);

    return Response.json(
      { ok: false, error: "Could not connect to Textbee." },
      { status: 502 }
    );
  }
}
