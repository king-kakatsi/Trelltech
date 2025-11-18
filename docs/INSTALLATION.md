# Installation Guide

Complete guide for setting up TrellTech on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Watchman** (Mac only, recommended) ([Installation](https://facebook.github.io/watchman/docs/install))

### Platform-Specific Requirements

#### For iOS Development (Mac only)
- **Xcode** 14.0 or higher ([Download from App Store](https://apps.apple.com/us/app/xcode/id497799835))
- **Xcode Command Line Tools**
- **iOS Simulator** (included with Xcode)

#### For Android Development
- **Android Studio** ([Download](https://developer.android.com/studio))
- **Android SDK** (included with Android Studio)
- **Android Emulator** (configured in Android Studio)
- **Java Development Kit (JDK)** 11 or higher

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18.x or higher

# Check npm version
npm --version   # Should be v9.x or higher

# Check Git
git --version   # Any recent version

# Check Watchman (Mac only)
watchman --version

# Check Java (for Android)
java -version   # Should be 11 or higher
```

## Step 1: Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/yourusername/trelltech.git

# Or using SSH
git clone git@github.com:yourusername/trelltech.git

# Navigate to project directory
cd trelltech
```

## Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will install:
# - React Native and Expo
# - Expo Router for navigation
# - NativeWind for styling
# - AsyncStorage for local storage
# - Axios for HTTP requests
# - And all other dependencies
```

## Step 3: Install Expo CLI Globally

```bash
npm install -g expo-cli
```

## Step 4: Configuration Setup

### Create Configuration File

Create `constants/config.js`:

```javascript
export const TRELLO_CONFIG = {
  API_KEY: 'your-trello-api-key-here',
  BASE_URL: 'https://api.trello.com/1',
};

export const COLORS = {
  primary: '#0079BF',
  danger: '#EB5A46',
  background: '#1a1a1a',
  surface: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
};

export const APP_CONFIG = {
  name: 'TrellTech',
  version: '1.0.0',
};
```

### Get Trello API Credentials

1. Go to [Trello Power-Ups Admin](https://trello.com/power-ups/admin)
2. Click "New" to create a new Power-Up
3. Fill in the required information
4. Copy your **API Key**
5. Click "Generate a Token" to get your **Token**
6. Add these to `constants/config.js`

## Step 5: iOS Setup (Mac Only)

### Install CocoaPods

```bash
# Install CocoaPods
sudo gem install cocoapods

# Navigate to iOS directory
cd ios

# Install iOS dependencies
pod install

# Go back to project root
cd ..
```

### Configure Xcode

1. Open Xcode
2. Go to Preferences > Locations
3. Select Command Line Tools version
4. Close Xcode

### Open iOS Simulator

```bash
# List available simulators
xcrun simctl list devices

# Open default simulator
open -a Simulator
```

## Step 6: Android Setup

### Install Android Studio

1. Download and install Android Studio
2. Open Android Studio
3. Go to Settings/Preferences > Appearance & Behavior > System Settings > Android SDK
4. Install the following:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator

### Configure Environment Variables

Add to your shell configuration file (`~/.bash_profile`, `~/.zshrc`, etc.):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Apply changes:
```bash
source ~/.zshrc  # or ~/.bash_profile
```

### Create Android Virtual Device (AVD)

1. Open Android Studio
2. Tools > Device Manager
3. Create Virtual Device
4. Select a device (e.g., Pixel 5)
5. Select a system image (API 33 recommended)
6. Finish setup

### Start Android Emulator

```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd Pixel_5_API_33
```

## Step 7: Start Development Server

```bash
# Start Expo development server
npx expo start

# Or with cache clearing
npx expo start -c
```

You should see a QR code and options to:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for web (not fully supported)

## Step 8: Run on Simulator/Emulator

### iOS Simulator

```bash
# Start on iOS
npx expo start --ios

# Or press 'i' after running npx expo start
```

### Android Emulator

```bash
# Start on Android
npx expo start --android

# Or press 'a' after running npx expo start
```

## Step 9: Run on Physical Device

### Using Expo Go App

1. **Install Expo Go**
   - iOS: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Download from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to Same Network**
   - Ensure your phone and computer are on the same Wi-Fi network

3. **Scan QR Code**
   - Run `npx expo start`
   - iOS: Use Camera app to scan QR code
   - Android: Use Expo Go app to scan QR code

### Using USB Connection (Development Build)

For faster performance, create a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Create development build for iOS
eas build --profile development --platform ios

# Create development build for Android
eas build --profile development --platform android
```

## Troubleshooting

### Node.js Issues

**Error: Node version not supported**
```bash
# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 18
nvm install 18
nvm use 18
```

### Metro Bundler Issues

**Error: Metro bundler failed to start**
```bash
# Clear cache
npx expo start -c

# Or manually clear
rm -rf node_modules
rm -rf .expo
npm install
```

### iOS Simulator Issues

**Simulator not opening**
```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Select Xcode command line tools
sudo xcode-select --switch /Applications/Xcode.app
```

**Build fails on iOS**
```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo start --ios
```

### Android Emulator Issues

**Emulator not connecting**
```bash
# Check ADB devices
adb devices

# Restart ADB server
adb kill-server
adb start-server

# Reverse port for Metro
adb reverse tcp:8081 tcp:8081
```

**Build fails on Android**
```bash
# Clear gradle cache
cd android
./gradlew clean
cd ..

# Clear build folder
rm -rf android/app/build
```

### Expo Issues

**Error: Expo SDK version mismatch**
```bash
# Update Expo SDK
npx expo install expo@latest

# Update all Expo packages
npx expo install --fix
```

**Error: Module not found**
```bash
# Clear watchman cache (Mac only)
watchman watch-del-all

# Clear Metro cache
npx expo start -c
```

### Network Issues

**Cannot connect to development server**
1. Ensure phone and computer on same Wi-Fi
2. Check firewall settings
3. Try connecting via LAN option in Expo Go
4. Use tunnel mode: `npx expo start --tunnel`

### Permission Issues (Mac)

**EACCES errors**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Watchman Issues (Mac)

**Watchman watch error**
```bash
# Reinstall watchman
brew uninstall watchman
brew install watchman
```

## Platform-Specific Setup

### macOS Setup

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Watchman
brew install watchman

# Install CocoaPods
sudo gem install cocoapods
```

### Windows Setup

1. Install Node.js from official website
2. Install Android Studio
3. Configure environment variables
4. Use PowerShell or Command Prompt for commands

### Linux Setup

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Watchman (optional)
sudo apt-get install watchman

# Install Android Studio from official website
```

## Verification

After installation, verify everything works:

```bash
# 1. Start development server
npx expo start

# 2. Run on iOS (Mac only)
npx expo start --ios

# 3. Run on Android
npx expo start --android

# 4. Check for errors in terminal
# Should see "Metro waiting on..." message
```

## Next Steps

After successful installation:

1. Read [QUICKSTART.md](./QUICKSTART.md) for a 5-minute getting started guide
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase
3. Check [API_INTEGRATION.md](./API_INTEGRATION.md) for Trello API setup
4. See [DEVELOPMENT.md](./DEVELOPMENT.md) for development workflow

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Search [GitHub Issues](https://github.com/yourusername/trelltech/issues)
3. Review [Expo Documentation](https://docs.expo.dev/)
4. Contact the development team

## Additional Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Expo Installation](https://docs.expo.dev/get-started/installation/)
- [Android Studio Setup](https://developer.android.com/studio/install)
- [Xcode Setup](https://developer.apple.com/xcode/)