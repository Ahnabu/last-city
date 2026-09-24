# ENVIRONMENT SETUP GUIDE — LAST CITY

## Required Tools & Runtimes

1. **Unity Engine:** Unity 6 (6000.x LTS) with WebGL, Android, and iOS Build Support modules.
2. **Node.js:** Node.js v18+ or v20+ LTS.
3. **IDE / Code Editor:** Visual Studio Code or JetBrains Rider with C# / TypeScript extensions.

---

## Environment Variables Protocol

All environment variables follow strict security guidelines:
- Never commit actual API keys or secrets to git.
- Add public keys to `.env.example` with descriptive placeholders and collection steps.
- Store local keys in `.env.local` (ignored by git).

---

## How to Collect Required Environment Variables

### 1. Firebase Client Web Credentials

These public credentials allow the web shell and client app to connect to Firebase services (Auth, Firestore/Realtime Database, Cloud Storage).

1. Log in to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project **LAST CITY** (or create a new project).
3. Navigate to **Project Settings** (click the gear icon in the top left sidebar).
4. Scroll down to the **Your apps** section.
5. If no Web app exists, click the **Web icon `</>`** to register an app named `LastCityWeb`.
6. Copy the values from the generated `firebaseConfig` object:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` $\rightarrow$ `apiKey`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` $\rightarrow$ `authDomain`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` $\rightarrow$ `projectId`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` $\rightarrow$ `storageBucket`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` $\rightarrow$ `messagingSenderId`
   - `NEXT_PUBLIC_FIREBASE_APP_ID` $\rightarrow$ `appId`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` $\rightarrow$ `measurementId` (optional)

### 2. Firebase Admin Server Credentials (Secret)

These secret credentials are used strictly by Next.js API routes or backend Cloud Functions to manage auth tokens and cloud save backups.

1. In Firebase Console, go to **Project Settings** $\rightarrow$ **Service accounts** tab.
2. Select **Node.js** and click **Generate new private key**.
3. A JSON key file will be downloaded (`last-city-firebase-adminsdk-xxxxx.json`).
4. Extract the following fields:
   - `FIREBASE_ADMIN_PRIVATE_KEY` $\rightarrow$ `private_key` (keep the `\n` linebreaks intact).
   - `FIREBASE_ADMIN_CLIENT_EMAIL` $\rightarrow$ `client_email`.

### 3. Unity WebGL Build Configuration

1. When building Unity for WebGL, output the build files to `web/public/game-build/`.
2. Unity generates a framework JSON manifest at `public/game-build/Build/<build_name>.json`.
3. Set `NEXT_PUBLIC_UNITY_BUILD_URL=/game-build/Build/game.json`.

---

## Unity WebGL Credential Injection

Unity WebGL builds cannot access runtime `.env` files directly. Credentials or config endpoints required by C# scripts are passed via:
1. `StreamingAssets/config.json` generated at build time by Next.js / build scripts.
2. Direct JS-to-Unity bridge call via `SendMessage('GameBootstrap', 'ReceiveConfig', configJson)` upon page load.
