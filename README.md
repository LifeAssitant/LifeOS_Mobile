# LifeOS Mobile

Expo (React Native) client for LifeOS — use **Expo Go** (SDK **57**) on your phone.

## Setup

```bash
npm install
npx expo start --lan
```

Then open **Expo Go** on your phone and scan the QR code.

### Phone + laptop on same Wi‑Fi

1. Start the backend so your phone can reach it (bind all interfaces):

```bash
# in LifeOS/
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start Expo in LAN mode (default):

```bash
npx expo start --lan
```

The app auto-detects your PC’s LAN IP from the Expo host (same host as the QR). Fallback URL is in `app.json` → `expo.extra.apiUrl`.

If login fails, update `app.json`:

```json
"extra": { "apiUrl": "http://YOUR_PC_LAN_IP:8000/api/v1" }
```

Find your IP with `ipconfig` (Windows) — use the Wi‑Fi adapter address, not `172.x` Hyper-V/WSL ones.

### Notes

- Phone and PC must be on the **same Wi‑Fi**
- Windows Firewall may ask to allow Python/uvicorn on private networks — allow it
- Use Expo SDK **57** Expo Go from the store (matches this project)
- Push notifications are skipped in Expo Go (removed by Expo in SDK 53+); they work in a later development build

## Screens

Home (today + chat) · Calendar · Tasks · Settings (hosted AI / BYOK)
