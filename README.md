# GlobalSMS Hub — Prototype

A responsive React/Vite frontend prototype for a temporary SMS platform.

## What works now
- Responsive dashboard and navigation
- Country list and search
- Demo allocation flow
- SMS inbox empty state and refresh feedback
- Pricing cards and integration notices

## Not live yet
- The displayed country availability is illustrative demo data.
- Demo allocations are not real phone numbers and cannot receive SMS.
- There is no real SMS provider connection or persistent user database.
- Checkout is disabled; no payment is collected.
- Easypaisa/JazzCash/card processing requires approved merchant integrations and server-side verification.

## Run locally
Requires Node.js 18+.

```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Production requirements
Before public launch, add secure authentication, a backend and database, a real authorized SMS provider adapter, authenticated inbound-SMS webhooks, rate limits, abuse prevention, privacy/retention controls, and approved payment gateway integrations. Do not advertise demo inventory as live.
