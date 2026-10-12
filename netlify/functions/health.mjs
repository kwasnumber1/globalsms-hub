export default async function handler() {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "GlobalSMS Hub",
      mode: "demo",
      realSmsConnected: false
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
