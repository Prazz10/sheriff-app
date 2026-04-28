# SheRiff - Women's Safety App
### Version 1.0.4

A mobile safety application built with React Native (Expo) designed to empower women with real-time safety features.

## Screenshots
Coming soon

## Features
- SOS Emergency trigger (button / shake / voice)
- Live GPS location sharing with guardians
- Safe route suggestions with risk scoring
- Community safety reports on live map
- Evidence capture (audio/video)
- Offline SMS fallback mode
- Guardian management system
- Trip mode with route monitoring

## Tech Stack
### Frontend
- React Native (Expo SDK 54)
- TypeScript
- React Navigation
- Expo Linear Gradient
- Expo Location
- Expo Camera
- Expo AV
- Supabase JS Client

### Backend (In Progress)
- Node.js + Express
- PostgreSQL (Supabase)
- Socket.io (Real-time)
- Twilio (SMS + Calls)

## Project Structure
\\\
SheRiff-V4/
+-- app/                    # All screens
¦   +-- WelcomeScreen.tsx
¦   +-- LoginScreen.tsx
¦   +-- SignupScreen.tsx
¦   +-- ProfileSetupScreen.tsx
¦   +-- DashboardScreen.tsx
¦   +-- SOSActiveScreen.tsx
¦   +-- TripModeScreen.tsx
¦   +-- LocationSharingScreen.tsx
¦   +-- CommunityReportsScreen.tsx
¦   +-- SafePlacesScreen.tsx
¦   +-- EvidenceCaptureScreen.tsx
¦   +-- GuardiansScreen.tsx
¦   +-- SettingsScreen.tsx
+-- components/             # Reusable components
¦   +-- Button.tsx
¦   +-- Card.tsx
¦   +-- Input.tsx
¦   +-- Checkbox.tsx
¦   +-- MapView.tsx
¦   +-- Progress.tsx
+-- lib/                    # Core services
¦   +-- supabase.ts
¦   +-- auth.ts
¦   +-- safety-data.ts
+-- assets/                 # Images and icons
\\\

## Setup Instructions
1. Clone the repo
\\\ash
git clone https://github.com/Prazz10/sheriff-app.git
cd sheriff-app
\\\

2. Install dependencies
\\\ash
npm install --legacy-peer-deps
\\\

3. Create .env file
\\\
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\\\

4. Start the app
\\\ash
npx expo start
\\\

5. Scan QR code with Expo Go app (SDK 54)

## Version History
- v1.0.4 - Complete frontend with all screens, navigation, auth flow, guardian management and settings
