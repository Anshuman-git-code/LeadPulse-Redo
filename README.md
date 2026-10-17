# LeadPulse

When someone fills out a Facebook Lead Ad, this app shows it on your iPhone instantly — no polling, no refresh. Just real time.

Built and runs locally on a MacBook Air during development. ngrok bridges the public internet to the local server so Meta can reach it.

![Architecture](./assets/Architecture-End-to-End-Flow.png)

---

## How it works

1. Someone submits a Facebook Lead Ad form
2. Meta sends an HTTPS POST to the ngrok public URL (which tunnels to `localhost:3000`)
3. The backend verifies the HMAC-SHA256 signature, sends `200` immediately, then fetches full lead details from the Meta Graph API
4. Lead data gets normalized (field names standardized) and published over Socket.IO
5. The iPhone receives the `new-lead` event and prepends it to the list — no interaction needed

Invalid `X-Hub-Signature-256` → request is discarded silently. Socket.IO traffic stays on the local Wi-Fi between the MacBook and iPhone.

---

## Project structure

```
LeadPulse/
├── assets/
│   └── Architecture-End-to-End-Flow.png
├── backend/
│   ├── src/
│   │   ├── server.js           # Express + Socket.IO setup, /health, /test/lead
│   │   ├── webhook/index.js    # GET verification + POST lead event handler
│   │   ├── meta/index.js       # Meta Graph API client (GET /v26.0/<leadgen_id>)
│   │   ├── leads/index.js      # Lead normalizer (full_name → name, etc.)
│   │   └── realtime/index.js   # Socket.IO publisher (io.emit 'new-lead')
│   ├── test/
│   │   └── normalize.test.js
│   └── .env.example
└── mobile/
    ├── src/
    │   ├── app/
    │   │   ├── _layout.tsx     # Root layout, ThemeProvider, tab shell
    │   │   ├── index.tsx       # Home screen — listens for new-lead, renders FlatList
    │   │   └── explore.tsx
    │   ├── components/
    │   │   ├── app-tabs.tsx    # Tab navigator (iOS/Android)
    │   │   └── app-tabs.web.tsx
    │   ├── services/
    │   │   └── socket.ts       # Socket.IO client, connects to MacBook LAN IP
    │   ├── hooks/
    │   └── constants/
    │       └── theme.ts
    └── .env.example
```

---

## Tech stack

**Backend**
| | |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Real-time | Socket.IO 4 |
| Dev server | nodemon |
| Tunnel | ngrok |
| Meta API | Graph API v26.0 |

**Mobile**
| | |
|---|---|
| Framework | React Native (Expo SDK 57) |
| Navigation | Expo Router |
| Real-time | socket.io-client 4 |
| Language | TypeScript |
| Dev client | Expo Go (iOS) |

---

## Setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

`.env` variables:

| Variable | What it is |
|---|---|
| `PORT` | Server port, default `3000` |
| `META_VERIFY_TOKEN` | Any long random string you choose — must match what you enter in Meta dashboard |
| `META_APP_SECRET` | Meta Developer Console → Your App → Settings → Basic |
| `META_PAGE_ACCESS_TOKEN` | Meta Developer Console → Tools → Graph API Explorer |
| `META_GRAPH_API_VERSION` | Use `v26.0` |

### Mobile

```bash
cd mobile
cp .env.example .env
npm install
npx expo start --lan --clear
```

`.env` variable:

| Variable | What it is |
|---|---|
| `EXPO_PUBLIC_SOCKET_URL` | Your MacBook's LAN IP + port, e.g. `http://192.168.1.x:3000` |

Find your LAN IP: System Settings → Wi-Fi → Details. Phone and Mac must be on the same Wi-Fi.

---

## Running locally

```bash
# 1. Start backend
cd backend && npm run dev

# 2. Expose it publicly
ngrok http 3000

# 3. Start mobile
cd mobile && npx expo start --lan --clear
```

Then in the Meta Developer Console:
- Webhooks → Callback URL: `https://<ngrok-id>.ngrok.io/webhook/meta`
- Verify token: same value as `META_VERIFY_TOKEN` in your `.env`
- Subscribe to the `leadgen` field

---

## Testing

### 1. Webhook verification (curl)

Confirms the backend correctly validates the verify token before Meta starts sending events.

```bash
curl -i --get 'http://localhost:3000/webhook/meta' \
  --data-urlencode 'hub.mode=subscribe' \
  --data-urlencode 'hub.verify_token=<your-META_VERIFY_TOKEN>' \
  --data-urlencode 'hub.challenge=987654321'
```

Expected: `200 OK` with body `987654321`.

### 2. Fake lead injection (curl)

Dev-only route that bypasses Meta entirely. Good for testing the Socket.IO → iPhone pipeline in isolation before wiring up Meta credentials.

```bash
curl -X POST http://localhost:3000/test/lead \
  -H 'Content-Type: application/json' \
  -d '{"name": "Test User", "email": "test@example.com", "phone": "9999999999"}'
```

The lead should appear on the iPhone immediately.

### 3. Meta Lead Ads testing tool (end-to-end)

This is the closest thing to a real lead without running an actual ad. It exercises the full pipeline — Meta sends a real webhook with a real `leadgen_id`, the backend fetches it from the Graph API, normalizes it, and pushes it to the phone.

1. Make sure the backend is running and ngrok is active
2. Go to Meta Developer Console → Your App → Lead Ads Testing Tool
3. Select your Facebook Page and Lead Form
4. Click **Submit** to generate a test lead
5. Watch the backend terminal — you should see:
   ```
   Lead event received: leadgen_id: <id>
   Retrieving lead <id> from Meta Graph API...
   Lead <id> retrieved successfully
   New lead emitted to X connected client(s)
   ```
6. The lead appears on the iPhone without any interaction

This is the test that confirms the entire system works end-to-end.

---

## Assumptions

- One Facebook Page and one Lead Ad form. No multi-page or multi-form routing is implemented.
- No database. Leads exist only in memory on the backend and in React state on the phone. Restarting either clears them.
- Single backend instance. Socket.IO runs in-process, so horizontal scaling would need a Redis adapter.
- LAN-only for mobile. The phone connects directly to the MacBook over local Wi-Fi. This won't work over mobile data without a deployed backend.
- No auth on the mobile app. Anyone who knows the socket URL can connect.
- The Page Access Token is a long-lived token (60-day expiry). It will need to be manually refreshed or replaced with a system user token before going to production.
- ngrok URL changes on every restart. The Meta webhook callback URL needs to be updated each time unless you're on a paid ngrok plan with a static domain.
