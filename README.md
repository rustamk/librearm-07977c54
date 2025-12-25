# LibreArm

Open-source blood pressure monitoring app that connects to Bluetooth blood pressure monitors and optionally syncs readings to Android Health Connect.

## Platform Support & Features

| Feature | Web Browser | Native Android App |
|---------|-------------|-------------------|
| View BP history & trends | ✅ | ✅ |
| Export to CSV/PDF | ✅ | ✅ |
| Bluetooth BP monitor connection | ⚠️ Chrome/Edge only* | ✅ Full support |
| Health Connect sync | ❌ Not available | ✅ Full support |
| Install to home screen | ✅ PWA | ✅ APK install |

> **\*Web Bluetooth Note:** Bluetooth connections in the browser only work on Chrome, Edge, and Opera on desktop (Windows/Mac/Linux) and Chrome on Android. iOS Safari does not support Web Bluetooth.

---

## Web Browser Usage

### Running in Browser (Development)

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd librearm

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open `http://localhost:5173` in **Chrome** or **Edge** for Bluetooth support.

### Browser Limitations

- **Bluetooth:** Only works on Chrome/Edge/Opera. Not supported on Firefox or Safari.
- **Health Connect:** Not available in browser - requires native Android app.
- **iOS:** Web Bluetooth is not supported on any iOS browser.

---

## Native Android App (Recommended)

The native Android app provides full functionality including reliable Bluetooth and Health Connect integration.

### Prerequisites

- **Node.js 18+** - [install with nvm](https://github.com/nvm-sh/nvm)
- **Android Studio** - [download here](https://developer.android.com/studio)
- **JDK 17** (bundled with Android Studio)
- **Android SDK 35** (install via Android Studio SDK Manager)
- **Physical Android device or emulator** running Android 8.0+ (API 26+)

### Step 1: Clone and Install

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd librearm

# Install dependencies (required flag for Health Connect compatibility)
npm install --legacy-peer-deps

# Build the web app
npm run build
```

> **Important:** After every `git pull`, run `npm install --legacy-peer-deps` to ensure all native plugins are installed.

### Step 2: Add Android Platform (First Time Only)

```sh
# Add Android platform
npx cap add android

# Initial sync
npx cap sync android
```

### Step 3: Configure Android Project

After adding the Android platform, you **must** configure these files:

#### 3.1 Update `android/variables.gradle`

Replace the entire contents with:

```gradle
ext {
    minSdkVersion = 26
    compileSdkVersion = 35
    targetSdkVersion = 35
    androidxActivityVersion = '1.8.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.9.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}
```

#### 3.2 Update `android/build.gradle`

Add this block at the **bottom** of the file (after `allprojects`):

```gradle
subprojects {
    configurations.configureEach { config ->
        config.exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
        config.exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
        
        config.resolutionStrategy {
            force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
            force 'org.jetbrains.kotlin:kotlin-stdlib-common:1.8.22'
        }
    }

    afterEvaluate {
        tasks.matching { it.name.contains("compileKotlin") }.configureEach {
            kotlinOptions {
                jvmTarget = "17"
            }
        }
    }
}

// Force capacitor-health-connect to use JVM 17
gradle.projectsEvaluated {
    def p = project(':capacitor-health-connect')

    p.tasks.configureEach { t ->
        if (!t.name.toLowerCase().contains('kotlin')) return

        if (t.hasProperty('kotlinOptions')) {
            try { t.kotlinOptions.jvmTarget = '17' } catch (Throwable ignored) {}
        }

        if (t.hasProperty('compilerOptions')) {
            try {
                def co = t.compilerOptions
                def jvmTargetEnum = t.class.classLoader.loadClass('org.jetbrains.kotlin.gradle.dsl.JvmTarget')
                def jvm17 = java.lang.Enum.valueOf(jvmTargetEnum, 'JVM_17')
                co.jvmTarget.set(jvm17)
            } catch (Throwable ignored) {}
        }
    }
}
```

#### 3.3 Update `android/app/build.gradle`

Ensure Java 17 compatibility in the `android` block:

```gradle
android {
    // ... existing config ...
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

#### 3.4 Update `android/app/src/main/AndroidManifest.xml`

This is the complete manifest configuration needed for Bluetooth and Health Connect:

**Add permissions** (before `<application>` tag):

```xml
<!-- Bluetooth permissions -->
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<!-- Health Connect permissions -->
<uses-permission android:name="android.permission.health.READ_BLOOD_PRESSURE" />
<uses-permission android:name="android.permission.health.WRITE_BLOOD_PRESSURE" />
<uses-permission android:name="android.permission.health.READ_HEART_RATE" />
<uses-permission android:name="android.permission.health.WRITE_HEART_RATE" />
```

**Add Health Connect visibility query** (inside `<manifest>`, before `<application>`):

```xml
<queries>
    <package android:name="com.google.android.apps.healthdata" />
</queries>
```

**Add Health Connect intent filter** (inside the main `<activity>` for MainActivity):

```xml
<activity android:name=".MainActivity" ...>
    <!-- existing intent-filters -->
    
    <!-- Health Connect permissions rationale -->
    <intent-filter>
        <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
    </intent-filter>
</activity>
```

**Add activity-alias for Android 14+** (inside `<application>`, after MainActivity):

```xml
<activity-alias
    android:name="ViewPermissionUsageActivity"
    android:exported="true"
    android:targetActivity=".MainActivity"
    android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
    <intent-filter>
        <action android:name="android.intent.action.VIEW_PERMISSION_USAGE" />
        <category android:name="android.intent.category.HEALTH_PERMISSIONS" />
    </intent-filter>
</activity-alias>
```

#### 3.5 Set JAVA_HOME Environment Variable

**Windows (PowerShell as Administrator):**
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\\Program Files\\Android\\Android Studio\\jbr\", "User")
```

**macOS:**
```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
# Add to ~/.zshrc or ~/.bash_profile for persistence
```

**Linux:**
```sh
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
# Add to ~/.bashrc for persistence
```

### Step 4: Build and Run

```sh
# Build web app
npm run build

# Sync to Android
npx cap sync android

# Clean build (recommended after config changes)
cd android && ./gradlew clean && cd ..

# Run on connected device or emulator
npx cap run android
```

### Step 5: Install Health Connect (Required for Sync)

On your Android device/emulator:
1. Open Google Play Store
2. Search for "Health Connect by Google"
3. Install the app
4. Open LibreArm and enable Health Connect sync

---

## Updating After Git Pull

After pulling new changes from the repository:

```sh
git pull
npm install --legacy-peer-deps
npm run build
npx cap sync android
```

---

## APK Build Locations

After building with Android Studio or `./gradlew assembleDebug`:

| Build Type | Location |
|------------|----------|
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` |
| Release APK | `android/app/build/outputs/apk/release/app-release-unsigned.apk` |

---

## Troubleshooting

### Health Connect permissions denied immediately

If tapping "Enable Sync" doesn't show the permission dialog:
1. Ensure Health Connect app is installed from Play Store
2. Verify AndroidManifest.xml has all the intent-filters listed above
3. Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx cap sync android`
4. Check logcat for errors: `adb logcat | grep -i health`

### Bluetooth not finding devices

- **In Browser:** Ensure you're using Chrome/Edge. Firefox and Safari don't support Web Bluetooth.
- **Native App:** Ensure Bluetooth permissions are granted in Android Settings → Apps → LibreArm → Permissions.

### Build errors with Kotlin/JVM version

1. Verify JAVA_HOME points to JDK 17
2. Ensure `android/build.gradle` has the subprojects block with JVM 17 config
3. Run `cd android && ./gradlew clean && cd ..`

---

## Technologies

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Native:** Capacitor 8
- **Bluetooth:** @capacitor-community/bluetooth-le (native), Web Bluetooth API (browser)
- **Health:** capacitor-health-connect
- **Charts:** Recharts

---

## License

Open source - see LICENSE for details.
