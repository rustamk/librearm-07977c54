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

> **Note:** The `--legacy-peer-deps` flag is required because `capacitor-health-connect@0.7.0` has a peer dependency on Capacitor 5, while this project uses Capacitor 8. The package still works correctly with this flag.

## Building for Android

```sh
# Build the web app
npm run build

# Sync with native platforms
npx cap sync

# Run on Android
npx cap run android
```

## Technologies

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Capacitor for native mobile
- Recharts for data visualization
- Web Bluetooth API

## Deployment

Open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click Share → Publish.

## License

Open source - see LICENSE for details.
