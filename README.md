# LifeOS Mobile

Expo (React Native) client for LifeOS — use **Expo Go** (SDK **57**) on your phone.

Matches the desktop app: Clay/Glass × Light/Dark themes, Google sign-in, Google Calendar, chat, Plan month view, and settings.

## Setup

```bash
npm install
npx expo start --lan
```

Then open **Expo Go** on your phone and scan the QR code.

### Phone + laptop on same Wi‑Fi

1. Start the backend so your phone can reach it:

```bash
# in LifeOS/
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start Expo in LAN mode:

```bash
npx expo start --lan
```

The app auto-detects your PC’s LAN IP from the Expo host. Fallback URL is in `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:8000/api/v1
```

Copy `.env.example` → `.env` if needed. `app.config.js` loads these into the app.

### Google sign-in + Calendar

In `.env`, set the **same** Supabase values as desktop:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then restart Expo. In Supabase Auth → URL configuration, allow redirect:

- `lifeos://auth/callback`

Google Calendar connect uses the same backend OAuth as desktop (`DESKTOP_OAUTH_SUCCESS_URL=lifeos://auth/calendar-connected`).

### Notes

- Phone and PC must be on the **same Wi‑Fi**
- Windows Firewall may ask to allow Python/uvicorn — allow it
- Use Expo SDK **57** Expo Go
- Push notifications are skipped in Expo Go; they work in a development build

## Screens

Home (chat) · Plan (month + day) · Tasks · Settings (theme, Google Calendar, AI)
