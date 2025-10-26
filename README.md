# AMPLIE Mobile App

> Privacy-first, emotion-aware music discovery platform built with React Native and Expo.

## 🎯 Overview

AMPLIE is a mobile application that:
- 🎤 **Detects emotions** from voice or text input
- 🎵 **Generates playlists** tailored to your mood
- 👥 **Blends group moods** for shared listening experiences
- 🔒 **Protects privacy** with on-device processing and explicit consent

---

## 🏗️ Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development toolchain
- **TypeScript** - Type-safe development
- **Clerk** - Authentication (Google/Apple OAuth)
- **Zustand** - State management
- **Expo Router** - File-based navigation
- **Expo AV** - Audio recording
- **NativeWind** - Tailwind CSS for React Native

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Expo CLI** - `npm install -g expo-cli`
- **iOS Simulator** (Mac only) or **Android Emulator**
- **Backend running** - See [AMPLIE-cloud README](../AMPLIE-cloud/README.md)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# Backend API URL
EXPO_PUBLIC_API=http://localhost:3000
```

**Get Clerk Key:**
1. Sign up at https://clerk.com
2. Create a new application
3. Copy the publishable key
4. Configure OAuth providers (Google, Apple)

### 3. Start Backend

The app requires the backend to be running. See [Backend Setup](../AMPLIE-cloud/README.md).

**Quick backend start:**
```bash
# In AMPLIE-cloud directory
docker run -p 8000:8000 chromadb/chroma  # Terminal 1
./start-demo.sh                          # Terminal 2
```

### 4. Start the App

```bash
npm start
```

This will:
- Start the Expo development server
- Show a QR code in the terminal
- Open Expo DevTools in your browser

### 5. Run on Device/Simulator

**iOS (Mac only):**
```bash
# Press 'i' in terminal
# Or scan QR code with Camera app
```

**Android:**
```bash
# Press 'a' in terminal
# Or scan QR code with Expo Go app
```

**Web (for testing UI only):**
```bash
# Press 'w' in terminal
```

---

## 📱 App Features

### 1. Authentication
- Sign in with Google or Apple
- Secure OAuth flow via Clerk
- Persistent sessions

### 2. Consent Management
- Privacy-first approach
- Granular permissions:
  - 🎤 Voice recording
  - ✍️ Text analysis
  - 📊 Mood history
- Toggle settings anytime

### 3. Emotion Detection
**Text Mode:**
- Type how you're feeling
- AI analyzes sentiment
- Get emotion + confidence score

**Voice Mode:**
- Record 3-6 second clips
- On-device audio processing
- Privacy-protected analysis

### 4. Playlist Generation
- View personalized track recommendations
- See match percentages
- Track metadata (tempo, energy, mood)
- Sort by relevance

### 5. Group Rooms
- Create/join mood blending rooms
- Multi-user playlist generation
- Real-time collaboration
- Privacy: only derived features shared

### 6. History
- Review past mood analyses
- Track emotional patterns
- Export data (coming soon)

---

## 🗂️ Project Structure

```
AMPLIE-app/
├── app/
│   ├── _layout.tsx           # Root layout with Clerk provider
│   ├── consent.tsx           # Privacy settings screen
│   ├── result.tsx            # Emotion result display
│   ├── playlist.tsx          # Track recommendations
│   ├── (auth)/
│   │   └── sign-in.tsx       # Authentication screen
│   └── (tabs)/
│       ├── _layout.tsx       # Tab navigation
│       ├── index.tsx         # Home screen
│       ├── voice.tsx         # Voice recording
│       ├── text.tsx          # Text input
│       ├── group.tsx         # Group rooms
│       ├── history.tsx       # Past analyses
│       └── settings.tsx      # App settings
├── components/
│   ├── MicButton.tsx         # Recording button
│   ├── WaveFormMini.tsx      # Audio visualizer
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── api.ts                # HTTP client
│   ├── consent.ts            # Consent state management
│   ├── history.ts            # History storage
│   ├── useColors.ts          # Theme colors
│   └── voice/
│       └── useVoiceRecorder.ts  # Audio recording hook
├── .env                      # Environment variables
└── package.json
```

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign in with Google
- [ ] Sign in with Apple
- [ ] Sign out
- [ ] Session persists on app restart

**Consent:**
- [ ] Toggle voice permission
- [ ] Toggle text permission
- [ ] Toggle history permission
- [ ] Settings saved correctly

**Text Input:**
- [ ] Type emotion text
- [ ] Analyze emotion
- [ ] View result with confidence
- [ ] Navigate to playlist

**Voice Input:**
- [ ] Request microphone permission
- [ ] Record 3-6 second clip
- [ ] Play back recording
- [ ] Analyze emotion

**Playlist:**
- [ ] View 10 recommended tracks
- [ ] See match percentages
- [ ] View track metadata
- [ ] Scroll through list

**Group Room:**
- [ ] Join existing room
- [ ] Set mood
- [ ] View blended playlist

**History:**
- [ ] View past analyses
- [ ] Filter by date
- [ ] Clear history

---

## 🎨 Customization

### Change Theme Colors

Edit `lib/useColors.ts`:

```typescript
export function useColors() {
  const colorScheme = useColorScheme();
  
  if (colorScheme === "dark") {
    return {
      bg: "#0a0a0a",      // Background
      text: "#ffffff",    // Primary text
      sub: "#888888",     // Secondary text
      card: "#1a1a1a",    // Card background
      border: "#333333",  // Borders
    };
  }
  
  // Light theme
  return {
    bg: "#ffffff",
    text: "#000000",
    sub: "#666666",
    card: "#f5f5f5",
    border: "#e0e0e0",
  };
}
```

### Add New Screens

1. Create file in `app/` or `app/(tabs)/`
2. Use Expo Router conventions
3. Add to tab navigation if needed

**Example:**
```tsx
// app/favorites.tsx
import { View, Text } from "react-native";

export default function FavoritesScreen() {
  return (
    <View>
      <Text>My Favorite Tracks</Text>
    </View>
  );
}
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"

**Problem:** App can't reach backend

**Solution:**
1. Check backend is running:
   ```bash
   curl http://localhost:3000/health
   ```
2. Verify `.env` has correct URL:
   ```env
   EXPO_PUBLIC_API=http://localhost:3000
   ```
3. For physical device, use computer's IP:
   ```env
   EXPO_PUBLIC_API=http://192.168.1.100:3000
   ```

### "Microphone permission denied"

**Problem:** Can't record audio

**Solution:**
1. On iOS: Settings → AMPLIE → Enable Microphone
2. On Android: App Settings → Permissions → Microphone
3. Restart app after enabling

### "Module not found" errors

**Problem:** Missing dependencies

**Solution:**
```bash
rm -rf node_modules .expo
npm install
npm start -- --clear
```

### App crashes on startup

**Problem:** Corrupted cache

**Solution:**
```bash
expo start --clear
# Or
npx expo start -c
```

### "Network request failed"

**Problem:** CORS or network issue

**Solution:**
1. Check backend CORS is enabled (it is by default)
2. Try using computer's local IP instead of `localhost`
3. Ensure firewall allows connections

---

## 🚢 Building for Production

### Create Development Build

```bash
# iOS
expo run:ios

# Android
expo run:android
```

### Create Production Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Submit to App Stores

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## 🔐 Security & Privacy

### Data Storage
- **Local:** Consent, history stored in `expo-secure-store`
- **Cloud:** Only emotion labels + confidence (no raw audio/text)
- **Sessions:** JWT tokens in secure storage

### Permissions
- **Microphone:** Only active during recording
- **Camera:** Not used
- **Location:** Not used
- **Contacts:** Not used

### Data Deletion
- Users can clear history anytime
- Sign out removes local data
- Contact support for full account deletion

---

## 📊 Performance Tips

### Optimize App Size
```bash
# Remove unused dependencies
npm prune

# Use Hermes engine (enabled by default)
# Enables faster startup and smaller bundle
```

### Reduce Network Calls
- Implement caching for playlists
- Batch API requests when possible
- Use optimistic UI updates

### Improve Audio Recording
- Use compressed audio formats (m4a)
- Limit recording duration (3-6 seconds)
- Clear audio cache periodically

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 Scripts Reference

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run web            # Run in web browser
npm test               # Run tests
npm run lint           # Lint code
```

---

## 🎓 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Clerk Authentication](https://clerk.com/docs)
- [Expo Router](https://expo.github.io/router/docs/)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/sezavala/AMPLIE/issues)
- **Email:** your-email@example.com
- **Discord:** CalHacks #amplie

---

## 🎯 Next Steps

1. ✅ Start backend: See [AMPLIE-cloud README](../AMPLIE-cloud/README.md)
2. ✅ Configure `.env` with Clerk keys
3. ✅ Run `npm start`
4. ✅ Test on device/simulator
5. ✅ Win CalHacks! 🏆

---

**Built with ❤️ for CalHacks 2025**
