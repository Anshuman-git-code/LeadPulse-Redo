# MetaLeadPulse

A proof-of-concept that receives Meta Lead Ads webhook events, retrieves full lead details from the Meta Graph API, normalizes them, and broadcasts new leads to an Expo/React Native app in real time using Socket.IO.

## Components

- `backend/`: Express, Socket.IO, Meta webhook, Graph API client, lead normalizer.
- `mobile/`: Expo/React Native client.
- ngrok: temporary public HTTPS tunnel for Meta to reach a local backend during development.

## Local development

1. Start the backend in `backend/` with `npm run dev`.
2. Start ngrok with `ngrok http 3000` so Meta can reach the webhook.
3. Set `mobile/.env` to use your Mac's LAN IP, then start Expo in `mobile/` with `npx expo start --lan`.
4. Test the local realtime pipeline with `POST /test/lead` before testing Meta credentials.

See `MetaLeadPulse-Rebuild-Guide.md` for the complete setup and test sequence.