import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  const [country, setCountry] = useState("US");
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(
    "Demo mode — real SMS provider connected nahi hai."
  );

  async function allocateNumber() {
    setStatus("Creating demo session...");

    try {
      const response = await fetch(
        "/.netlify/functions/allocate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ country })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setSession(data.session);
      setMessages(data.messages || []);
      setStatus(data.message);
    } catch (error) {
      setStatus(
        "Backend unavailable. Netlify deployment check karo."
      );
    }
  }

  async function refreshInbox() {
    if (!session) return;

    try {
      const response = await fetch(
        "/.netlify/functions/inbox?sessionId=" +
        encodeURIComponent(session.id)
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Inbox request failed");
      }

      setMessages(data.messages || []);
      setStatus(data.message);
    } catch {
      setStatus("Inbox refresh nahi ho saka.");
    }
  }

  async function releaseSession() {
    if (!session) return;

    try {
      const response = await fetch(
        "/.netlify/functions/release",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sessionId: session.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Release failed");
      }

      setSession(null);
      setMessages([]);
      setStatus(data.message);
    } catch {
      setStatus("Session release nahi ho saka.");
    }
  }

  return (
    <main className="container">
      <header>
        <div className="logo">✦</div>
        <div>
          <h1>GlobalSMS Hub</h1>
          <p>Temporary SMS Dashboard</p>
        </div>
      </header>

      <section className="hero">
        <span>FREE STARTER PROJECT</span>
        <h2>Temporary SMS<br />Dashboard</h2>
        <p>
          Select a country and create a demo session.
          Real phone numbers are not connected yet.
        </p>
      </section>

      <section className="notice">
        <strong>Demo limitation</strong>
        <p>
          This project displays sample data only.
          It does not receive real SMS or OTP messages.
          An authorized SMS provider is required for real SMS.
        </p>
      </section>

      <section className="card">
        <h2>Choose a country</h2>

        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
        >
          <option value="US">🇺🇸 United States</option>
          <option value="GB">🇬🇧 United Kingdom</option>
          <option value="PH">🇵🇭 Philippines</option>
          <option value="CA">🇨🇦 Canada</option>
          <option value="AU">🇦🇺 Australia</option>
        </select>

        <button onClick={allocateNumber}>
          + Create Demo Session
        </button>

        {session && (
          <div className="number">
            <small>DEMO NUMBER — NOT REAL</small>
            <h2>{session.phoneNumber}</h2>
            <p>{session.countryName}</p>
            <p>Session: {session.id.slice(0, 8)}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>SMS Inbox</h2>

        {!session && (
          <p className="empty">
            Create a demo session to see sample messages.
          </p>
        )}

        {messages.map((message, index) => (
          <article className="message" key={message.id || index}>
            <strong>{message.from}</strong>
            <p>{message.body}</p>
            <small>{message.receivedAt}</small>
          </article>
        ))}

        <div className="actions">
          <button
            className="secondary"
            onClick={refreshInbox}
            disabled={!session}
          >
            Refresh Inbox
          </button>

          <button
            className="danger"
            onClick={releaseSession}
            disabled={!session}
          >
            Release Session
          </button>
        </div>
      </section>

      <p className="status">{status}</p>

      <footer>
        GlobalSMS Hub · Demo backend · Real SMS not connected
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
