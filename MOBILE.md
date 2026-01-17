# StableTrack Mobile Development

This guide covers building and running StableTrack as a native mobile app using Capacitor 8.x.

## Prerequisites

### For iOS Development
- macOS with Xcode 15 or later
- CocoaPods: `sudo gem install cocoapods`
- iOS Simulator or physical iOS device

### For Android Development
- Android Studio with SDK 34 or later
- Java Development Kit (JDK) 17 or later
- Android device or emulator

## Installation

All Capacitor dependencies are already installed. The project includes:

- **@capacitor/core** v8.0.1 - Core Capacitor runtime
- **@capacitor/cli** v8.0.1 - Capacitor CLI tools
- **@capacitor/ios** v8.0.1 - iOS platform
- **@capacitor/android** v8.0.1 - Android platform

### Plugins Installed:
- **@capacitor/splash-screen** - Native splash screen
- **@capacitor/status-bar** - Status bar styling
- **@capacitor/camera** - Camera and photo gallery access
- **@capacitor/filesystem** - File system access
- **@capacitor/push-notifications** - Push notifications support
- **@capacitor/haptics** - Haptic feedback
- **@capacitor/share** - Native share dialog
- **@capacitor/app** - App state and URL handling

## Configuration

The Capacitor configuration is in `capacitor.config.ts`:

```typescript
{
  appId: 'com.stabletrack.app',
  appName: 'StableTrack',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  }
}
```

## Building for Mobile

### 1. Build the Next.js App

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### 2. Sync with Native Projects

```bash
npm run mobile:sync
```

This copies web assets and updates native project configurations.

### 3. Add Platforms (First Time Only)

For iOS:
```bash
npm run mobile:add:ios
```

For Android:
```bash
npm run mobile:add:android
```

## Running on Devices

### iOS

**Open in Xcode:**
```bash
npm run mobile:open:ios
```

**Run directly:**
```bash
npm run mobile:run:ios
```

**Building for Production:**
1. Open Xcode: `npm run mobile:open:ios`
2. Select your team in Signing & Capabilities
3. Archive the app (Product > Archive)
4. Upload to App Store Connect

### Android

**Open in Android Studio:**
```bash
npm run mobile:open:android
```

**Run directly:**
```bash
npm run mobile:run:android
```

**Building for Production:**
1. Open Android Studio: `npm run mobile:open:android`
2. Build > Generate Signed Bundle / APK
3. Follow the wizard to create a signed APK or App Bundle
4. Upload to Google Play Console

## Mobile Utilities

The project includes mobile utility functions in `src/lib/mobile.ts`:

### Check if Running on Mobile
```typescript
import { isMobile, getPlatform } from '@/lib/mobile';

if (isMobile()) {
  console.log('Running on:', getPlatform()); // 'ios' or 'android'
}
```

### Camera Access
```typescript
import { takePhoto, pickPhoto } from '@/lib/mobile';

// Take a new photo
const photoUri = await takePhoto();

// Pick from gallery
const photoUri = await pickPhoto();
```

### File System
```typescript
import { saveFile } from '@/lib/mobile';
import { Directory } from '@capacitor/filesystem';

await saveFile('report.pdf', base64Data, Directory.Documents);
```

### Share Content
```typescript
import { shareContent } from '@/lib/mobile';

await shareContent(
  'Check out StableTrack',
  'Manage your barn with ease',
  'https://stabletrack.app'
);
```

### Haptic Feedback
```typescript
import { hapticImpact } from '@/lib/mobile';
import { ImpactStyle } from '@capacitor/haptics';

await hapticImpact(ImpactStyle.Medium);
```

### Status Bar
```typescript
import { configureStatusBar } from '@/lib/mobile';
import { Style } from '@capacitor/status-bar';

await configureStatusBar(Style.Dark, '#ffffff');
```

## Environment Variables for Mobile

Mobile apps need different environment variable handling. Create a `.env.production` file:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

These will be bundled into the mobile app at build time.

## Troubleshooting

### iOS Build Issues

**CocoaPods errors:**
```bash
cd ios/App
pod repo update
pod install
```

**Certificate issues:**
- Open Xcode, go to Preferences > Accounts
- Add your Apple Developer account
- Select your team in the project's Signing & Capabilities

### Android Build Issues

**Gradle errors:**
```bash
cd android
./gradlew clean
./gradlew build
```

**SDK issues:**
- Open Android Studio > SDK Manager
- Install Android SDK 34 and build tools

### Sync Issues

If changes aren't appearing in the mobile app:

```bash
# Clean build
rm -rf .next out

# Rebuild
npm run build

# Sync again
npm run mobile:sync
```

## App Store Submission

### iOS App Store

1. Create an App ID in Apple Developer Portal
2. Configure App Store Connect listing
3. Archive and upload from Xcode
4. Submit for review

Required assets:
- App Icon: 1024x1024px
- Screenshots for iPhone and iPad
- Privacy policy URL

### Google Play Store

1. Create app in Google Play Console
2. Configure store listing
3. Upload signed AAB or APK
4. Submit for review

Required assets:
- App Icon: 512x512px
- Feature graphic: 1024x500px
- Screenshots for phone and tablet
- Privacy policy URL

## Update Workflow

When you update the app:

1. Update version in `package.json`
2. Build: `npm run build`
3. Sync: `npm run mobile:sync`
4. Update native version numbers:
   - iOS: `ios/App/App/Info.plist` (CFBundleShortVersionString)
   - Android: `android/app/build.gradle` (versionCode, versionName)
5. Build and submit to stores

## Live Updates (Optional)

For over-the-air updates without app store releases, consider:
- [Ionic Appflow](https://ionic.io/appflow)
- [Microsoft App Center](https://appcenter.ms)

## Support

For Capacitor-specific issues, see:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor GitHub Issues](https://github.com/ionic-team/capacitor/issues)
