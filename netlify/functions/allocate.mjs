const countries = {
  US: {
    name: "United States",
    number: "+1 202-555-0147"
  },
  GB: {
    name: "United Kingdom",
    number: "+44 7700 900123"
  },
  PH: {
    name: "Philippines",
    number: "+63 905 555 0147"
  },
  CA: {
    name: "Canada",
    number: "+1 416-555-0147"
  },
  AU: {
    name: "Australia",
    number: "+61 490 000 147"
  }
};

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

  const selected = countries[body.country];

  if (!selected) {
    return reply(400, {
      error: "Unsupported country."
    });
  }

  const session = {
    id: crypto.randomUUID(),
    country: body.country,
    countryName: selected.name,
    phoneNumber: selected.number,
    createdAt: new Date().toISOString(),
    demo: true
  };

  const messages = [
    {
      id: crypto.randomUUID(),
      from: "GlobalSMS Demo",
      body: "SAMPLE MESSAGE ONLY — no real SMS or OTP was received.",
      receivedAt: new Date().toISOString()
    }
  ];

  return reply(200, {
    session,
    messages,
    message:
      "Demo session created. This is not a real phone number."
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
