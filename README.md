# SheRiff - Women Safety Application
### Version 1.0.6 | 2026

A comprehensive mobile safety application built with React Native (Expo) to empower women with real-time safety features.

---

## Hardware Requirements

### Minimum Device Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Android 8.0 (API 26) | Android 11+ |
| RAM | 2 GB | 4 GB |
| Storage | 100 MB free | 500 MB free |
| Processor | 1.4 GHz Quad-core | 2.0 GHz Octa-core |
| GPS | Required | High Accuracy GPS |
| Camera | 5 MP | 12 MP |
| Microphone | Required | Stereo Microphone |
| Internet | 3G (1 Mbps) | 4G/5G |
| Battery | 2000 mAh | 4000 mAh+ |

### Development Machine Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| OS | Windows 10 / macOS 10.15 | Windows 11 / macOS 13 |
| RAM | 8 GB | 16 GB |
| Storage | 10 GB free | 20 GB free |
| Node.js | v18.x | v20.x LTS |
| Internet | Required for Expo/Supabase | Broadband |

---

## Software Requirements

### Frontend
| Software | Version | Purpose |
|----------|---------|---------|
| React Native | 0.81.5 | Mobile framework |
| Expo SDK | 54.0.33 | Development platform |
| TypeScript | 5.9.2 | Programming language |
| Node.js | 18+ | Runtime environment |
| Expo Go | 54.x | Testing on device |

### Backend
| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | Server runtime |
| Express.js | 4.x | REST API framework |
| TypeScript | 5.x | Programming language |
| Socket.io | 4.x | Real-time communication |
| Supabase JS | 2.x | Database client |

### Key Libraries
| Library | Purpose |
|---------|---------|
| expo-location | GPS tracking |
| expo-camera | Photo/Video capture |
| expo-audio | Audio recording |
| @react-navigation/native | Screen navigation |
| react-native-maps | Map display |
| @supabase/supabase-js | Database operations |
| socket.io-client | Real-time location |

### External Services
| Service | Purpose | Cost |
|---------|---------|------|
| Supabase | Database + Auth | Free tier |
| Fast2SMS | SMS notifications | Free tier |
| OpenStreetMap | Map data | Free |
| Google Maps | Navigation/Directions | Free (link only) |

### Development Tools
| Tool | Purpose |
|------|---------|
| VS Code | Code editor |
| Git | Version control |
| GitHub | Code repository |
| Expo CLI | Build and run app |
| Supabase Dashboard | Database management |

---

## Features
- SOS Emergency trigger with countdown
- Live GPS location sharing with guardians
- Safe route trip monitoring
- Community safety reports
- Evidence capture (audio, photo, video)
- Offline SMS fallback mode
- Guardian management system
- Nearby safe places finder
- Settings with profile management

---

## Project Structure
\\\
SheRiff-V4/                    # Frontend
+-- app/                       # All screens (13 screens)
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
+-- components/                # Reusable UI components
+-- lib/                       # Core services
¦   +-- supabase.ts
¦   +-- auth.ts
¦   +-- api.ts
¦   +-- safety-data.ts
+-- assets/

SheRiff-Backend/               # Backend (separate branch)
+-- src/
¦   +-- controllers/
¦   +-- routes/
¦   +-- services/
¦   +-- index.ts
+-- package.json
\\\

---

## Setup Instructions

### Frontend Setup
\\\ash
git clone https://github.com/Prazz10/sheriff-app.git
cd sheriff-app
npm install --legacy-peer-deps
\\\

Create \.env\ file:
\\\
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\\\

Run the app:
\\\ash
npx expo start
\\\

### Backend Setup
\\\ash
git clone -b backend https://github.com/Prazz10/sheriff-app.git sheriff-backend
cd sheriff-backend
npm install
\\\

Create \.env\ file:
\\\
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key
FAST2SMS_API_KEY=your_fast2sms_key
JWT_SECRET=your_jwt_secret
\\\

Run backend:
\\\ash
npm run dev
\\\

---

## Database Setup (Supabase SQL)
\\\sql
CREATE TABLE users (id UUID PRIMARY KEY, full_name TEXT, email TEXT, phone TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE guardians (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID REFERENCES users(id), guardian_name TEXT, guardian_phone TEXT, relationship TEXT, created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE sos_events (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID REFERENCES users(id), latitude FLOAT, longitude FLOAT, status TEXT DEFAULT 'active', created_at TIMESTAMP DEFAULT NOW());
CREATE TABLE trips (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID REFERENCES users(id), origin TEXT, destination TEXT, status TEXT DEFAULT 'active', started_at TIMESTAMP DEFAULT NOW(), ended_at TIMESTAMP);
CREATE TABLE location_events (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, trip_id UUID REFERENCES trips(id), user_id UUID REFERENCES users(id), latitude FLOAT, longitude FLOAT, timestamp TIMESTAMP DEFAULT NOW());
\\\

---

## Version History
- v1.0.6 - Fast2SMS integration, Evidence sharing, Camera fix, Test cases
- v1.0.5 - Backend connected, SOS + Auth + Guardians wired up
- v1.0.4 - Complete frontend with all screens and navigation
- v1.0.3 - Navigation fixes, ProfileSetup working
- v1.0.2 - Signup/Login flow completed
- v1.0.1 - Initial React Native setup
- v1.0.0 - Project initialization
