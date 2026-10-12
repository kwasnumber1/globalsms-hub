export default async function handler(request) {
  if (request.method !== "POST") {
    return reply(405, {
      error: "POST request required."
    });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return reply(400, {
      error: "Invalid JSON."
    });
  }

  if (!body.sessionId) {
    return reply(400, {
      error: "sessionId is required."
    });
  }

  return reply(200, {
    ok: true,
    released: true,
    message:
      "Demo session closed. No real phone number was rented or released."
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
