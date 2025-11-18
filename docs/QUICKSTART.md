# Quick Start Guide

Get TrellTech running in 5 minutes.

## Prerequisites Check

Before starting, verify you have:

```bash
node --version  # v18+ required
npm --version   # v9+ required
```

If not installed, see [INSTALLATION.md](./INSTALLATION.md#prerequisites)

## 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/yourusername/trelltech.git
cd trelltech

# Install dependencies
npm install
```

### Step 2: Configure API (1 minute)

Create `constants/config.js`:

```javascript
export const TRELLO_CONFIG = {
  API_KEY: 'paste-your-api-key-here',
  BASE_URL: 'https://api.trello.com/1',
};

export const COLORS = {
  primary: '#0079BF',
  danger: '#EB5A46',
  background: '#1a1a1a',
  surface: '#2a2a2a',
};
```

Get your API key from: [Trello Developer Portal](https://trello.com/power-ups/admin)

### Step 3: Start App (2 minutes)

```bash
# Start development server
npx expo start
```

Choose your platform:
- Press **`i`** for iOS Simulator (Mac only)
- Press **`a`** for Android Emulator
- Scan **QR code** with Expo Go app on your phone

That's it! TrellTech should now be running.

---

## Running on Different Platforms

### iOS Simulator (Mac Only)

```bash
# Quick start on iOS
npx expo start --ios
```

**First time?**
1. Xcode will open automatically
2. Wait for simulator to boot (30-60 seconds)
3. App will install and launch

**Troubleshooting:**
- Simulator not opening? Run: `sudo xcode-select --switch /Applications/Xcode.app`
- Build failed? Try: `cd ios && pod install && cd ..`

### Android Emulator

```bash
# Quick start on Android
npx expo start --android
```

**First time?**
1. Android Studio AVD will launch
2. Wait for emulator to boot (60-90 seconds)
3. App will install and launch

**Troubleshooting:**
- Emulator not found? Open Android Studio > Tools > Device Manager
- Connection issues? Run: `adb reverse tcp:8081 tcp:8081`

### Physical Device

**Easiest Method: Expo Go App**

1. **Install Expo Go:**
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to same Wi-Fi** as your computer

3. **Scan QR code:**
   ```bash
   npx expo start
   ```
   - iOS: Use Camera app
   - Android: Use Expo Go app

4. **App opens in Expo Go** - Ready to use!

---

## Development Workflow

### Hot Reload

Changes you make are automatically reflected in the app:

1. Edit any file in `app/` or `components/`
2. Save the file (Cmd+S / Ctrl+S)
3. App updates automatically within 1-2 seconds

**Not updating?**
- Shake device or press `r` in terminal to reload manually
- Press `shift+m` to open developer menu

### Opening Developer Menu

**On Simulator/Emulator:**
- iOS: Press `Cmd+D`
- Android: Press `Cmd+M` (Mac) or `Ctrl+M` (Windows/Linux)

**On Physical Device:**
- Shake your device

**In Terminal:**
- Press `m` to open menu
- Press `r` to reload
- Press `c` to clear cache

### Viewing Console Logs

```bash
# Terminal shows all console.log() output
npx expo start

# Filter logs
npx expo start | grep "ERROR"
```

---

## Quick Testing Checklist

After starting the app, verify these features work:

### 1. Authentication
- [ ] Click "Connect with Trello"
- [ ] Redirects to Trello authorization
- [ ] Returns to app after authorization
- [ ] Shows home screen with workspaces

### 2. Workspaces
- [ ] See list of your Trello workspaces
- [ ] Click on a workspace
- [ ] Opens boards list

### 3. Boards
- [ ] See boards in workspace
- [ ] Click on a board
- [ ] Opens Kanban view

### 4. Kanban Carousel
- [ ] Swipe left/right between columns
- [ ] See cards in each column
- [ ] Smooth animations

### 5. Cards
- [ ] Click on a card
- [ ] Opens card detail screen
- [ ] See description and comments

---

## Common Quick Fixes

### App Not Starting

```bash
# Clear cache and restart
npx expo start -c
```

### White Screen on Launch

```bash
# Reload app
# Press 'r' in terminal or shake device
```

### Changes Not Reflecting

```bash
# Force reload
# Press 'r' in terminal

# If still not working, clear cache
npx expo start -c
```

### Metro Bundler Error

```bash
# Kill process and restart
killall node
npx expo start
```

### iOS Build Failed

```bash
# Reinstall pods
cd ios
pod install
cd ..
npx expo start --ios
```

### Android Build Failed

```bash
# Clean gradle
cd android
./gradlew clean
cd ..
npx expo start --android
```

---

## Quick Commands Reference

```bash
# Start development server
npx expo start

# Start with cache clearing
npx expo start -c

# Start on specific platform
npx expo start --ios        # iOS
npx expo start --android    # Android

# Install new package
npm install package-name
npx expo install package-name  # For Expo packages

# Update dependencies
npx expo install --fix

# Check for issues
npx expo doctor

# View logs
npx expo start --dev-client
```

---

## Keyboard Shortcuts (in Terminal)

While `npx expo start` is running:

- **`i`** - Open iOS Simulator
- **`a`** - Open Android Emulator
- **`w`** - Open web browser
- **`r`** - Reload app
- **`m`** - Open developer menu
- **`shift+m`** - More options
- **`c`** - Clear cache
- **`?`** - Show all commands

---

## Development Tips

### Faster Reload Times

1. **Use Fast Refresh** (automatic)
   - Edit and save files
   - App updates instantly

2. **Keep Terminal Open**
   - Don't close Metro bundler
   - Faster subsequent reloads

3. **Use Simulator/Emulator**
   - Faster than physical device
   - Better debugging tools

### Efficient Development

```bash
# Open multiple terminals for better workflow

# Terminal 1: Metro bundler
npx expo start

# Terminal 2: Git operations
git status
git add .
git commit -m "feat: add feature"

# Terminal 3: Testing commands
npm test
```

### Quick Debugging

```javascript
// Add console logs anywhere
console.log('Debug:', variable);

// Use React DevTools
// Press 'm' in terminal > "Open React DevTools"
```

---

## What's Next?

Now that TrellTech is running:

1. **Explore the Code**
   - Start with `app/(tabs)/home.jsx`
   - Review `services/trello.js` for API calls
   - Check `components/` for UI elements

2. **Read Documentation**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Understand the structure
   - [API_INTEGRATION.md](./API_INTEGRATION.md) - Learn Trello API
   - [STYLING_GUIDE.md](./STYLING_GUIDE.md) - Master NativeWind

3. **Start Developing**
   - Pick a feature from the roadmap
   - Create a new branch
   - Make changes and test
   - Submit a pull request

4. **Join the Team**
   - Read [CONTRIBUTING.md](./CONTRIBUTING.md)
   - Check [GitHub Issues](https://github.com/yourusername/trelltech/issues)
   - Contact team members

---

## Getting Help

**Still stuck?**

1. Check [INSTALLATION.md](./INSTALLATION.md#troubleshooting)
2. Review [Expo Documentation](https://docs.expo.dev/)
3. Search [GitHub Issues](https://github.com/yourusername/trelltech/issues)
4. Ask the team on Slack/Discord

**Common Resources:**
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)

---

Happy coding! 