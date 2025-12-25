# LibreArm

Open-source blood pressure monitoring app that connects to Bluetooth blood pressure monitors and optionally syncs readings to Android Health Connect.

## Features

- 📱 Connect to Bluetooth blood pressure monitors
- 📊 Track and visualize BP trends over time
- ❤️ Monitor heart rate alongside blood pressure
- 🔄 Sync readings to Android Health Connect (optional)
- 📤 Export readings to CSV
- 🔒 Privacy-focused - all data stored locally

## Local Development

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Android Studio (for Android builds)
- JDK 17

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies (use --legacy-peer-deps due to Health Connect package compatibility)
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

> **Important:** After every `git pull`, run `npm install --legacy-peer-deps` again so newly-added native plugins (like Bluetooth LE) are present in `node_modules`.

> **Note:** The `--legacy-peer-deps` flag is required because `capacitor-health-connect@0.7.0` has a peer dependency on Capacitor 5, while this project uses Capacitor 8. The package still works correctly with this flag.

## Building for Android

### First-time Setup

After cloning, you need to add the Android platform and configure it:

```sh
# Build the web app
npm run build

# Add Android platform (first time only)
npx cap add android

# Sync with native platforms
npx cap sync android
```

### Required Android Configuration

#### 1. Update `android/variables.gradle`

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

#### 2. Update `android/build.gradle`

Add this at the bottom of the file (after `allprojects`):

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

#### 3. Update `android/app/build.gradle`

Ensure Java 17 compatibility:

```gradle
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

#### 4. Update `android/app/src/main/AndroidManifest.xml`

Add these permissions before the `<application>` tag:

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

Add Health Connect visibility query inside `<manifest>`:

```xml
<queries>
    <package android:name="com.google.android.apps.healthdata" />
</queries>
```

Add Health Connect intent filter inside `<application>`:

```xml
<activity
    android:name="androidx.health.connect.client.PermissionController$PermissionRequestActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" />
    </intent-filter>
</activity>

<activity-alias
    android:name="ViewPermissionUsageActivity"
    android:exported="true"
    android:targetActivity="androidx.health.connect.client.PermissionController$PermissionRequestActivity"
    android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
    <intent-filter>
        <action android:name="android.intent.action.VIEW_PERMISSION_USAGE" />
        <category android:name="android.intent.category.HEALTH_PERMISSIONS" />
    </intent-filter>
</activity-alias>
```

#### 5. Set JAVA_HOME

Make sure JAVA_HOME points to JDK 17:

**Windows (PowerShell as Admin):**
```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
```

**macOS/Linux:**
```sh
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Building and Running

```sh
# Build web app
npm run build

# Sync changes
npx cap sync android

# Clean and build (recommended after config changes)
cd android
./gradlew clean
cd ..

# Run on device/emulator
npx cap run android
```

### APK Location

After building, the APK is located at:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## Technologies

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Capacitor for native mobile
- @capacitor-community/bluetooth-le for native Bluetooth
- capacitor-health-connect for Health Connect integration
- Recharts for data visualization

## Deployment

Open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click Share → Publish.

## License

Open source - see LICENSE for details.
