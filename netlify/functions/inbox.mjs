export default async function handler(request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return reply(400, {
      error: "sessionId is required."
    });
  }

  return reply(200, {
    messages: [
      {
        id: "sample-message",
        from: "GlobalSMS Demo",
        body:
          "SAMPLE INBOX — no real SMS or OTP was received.",
        receivedAt: new Date().toISOString()
      }
    ],
    message:
      "Demo inbox refreshed. Real SMS provider is not connected."
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
