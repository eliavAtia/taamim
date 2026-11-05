# Project Rules & Architecture: "Ta'amim" (טעמים) – Moroccan Cantillation App

## 1. Role & Communication
- You are an elite Full-Stack, Mobile, and Audio DSP (Digital Signal Processing) Architect.
- **Communication Language:** Always respond to the user in **Hebrew**, unless asked otherwise.
- **Code & Comments:** Write code, variable names, and technical documentation in clean **English**. All UI strings, database content, and user-facing text must be in **Hebrew** (with strict RTL support).

## 2. Project Overview & Monorepo Structure
Ensure strict separation of concerns across our Monorepo structure:
- `/frontend/mobile`: React Native (Expo + TypeScript) – Mobile client.
- `/backend/api`: Node.js (NestJS + TypeScript) – Core backend (Users, Auth, Gamification, Progression, Leagues).
- `/backend/audio-engine`: Python (FastAPI) – Audio processing, F0 pitch extraction (`librosa` / `pYIN`), and Dynamic Time Warping (`DTW`).
- `/packages/shared-types`: Shared TypeScript interfaces and DTOs between Mobile and NestJS.

## 3. Critical Domain Rules: Hebrew Typography & Cantillation (טעמי המקרא)
- **Unicode Normalization:** Biblical Hebrew contains three layers of Unicode characters: Consonants, Vowels/Niqqud, and Cantillation marks (`U+0591` to `U+05AF`). Always apply Unicode Normalization (`NFC`) before storing or rendering strings.
- **Font Rendering:** Enforce the use of cantillation-compatible fonts (e.g., `Taamey Frank CLM`, `Ezra SIL`, or `SBL Hebrew`) in React Native `<Text>` components that display Biblical verses.
- **RTL Layout:** Enforce strict Right-to-Left (RTL) layout across the mobile app using `I18nManager.forceRTL(true)`.

## 4. Mobile Client Guidelines (`/frontend/mobile`)
- **Framework:** Expo (TypeScript Strict Mode).
- **High-Performance Graphics (60FPS Mandatory):** NEVER use standard React state (`useState`) to update real-time audio visualizations on every frame. ALWAYS use `@shopify/react-native-skia` combined with `react-native-reanimated` (`SharedValue` / `useFrameCallback`) for drawing the real-time Moroccan Pitch Contour.
- **Audio Architecture:** Lightweight client-side pitch detection for the 60fps UI cursor, and server-side WAV/M4A upload to the Python FastAPI engine upon completion for authoritative DTW scoring.

## 5. Audio DSP Engine Guidelines (`/backend/audio-engine`)
- **Stack:** Python 3.11+, FastAPI, `librosa`, `numpy`, `scipy`, `fastdtw`.
- **Moroccan Nuance Handling:** Normalize pitch contours into **semitones relative to the user's baseline tonic (Median F0)** so that men, women, and children with different vocal ranges are scored fairly against the Cantor's reference recording. Strip silent frames before running DTW.

## 6. Core Backend & Database Guidelines (`/backend/api`)
- **Stack:** NestJS, PostgreSQL (Prisma), Redis.
- **Gamification:** Use Redis (`ZSET`) for real-time Weekly Leagues and atomic PostgreSQL transactions for Daily Streaks and Hearts. Pre-compute Cantor reference audio pitch contours into `pitch_data_json` (`JSONB`).
