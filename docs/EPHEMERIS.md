# Swiss Ephemeris Integration

This document provides information about the Swiss Ephemeris integration in the application, including setup, troubleshooting, and development notes.

## Overview

The application uses the Swiss Ephemeris library for high-precision astronomical calculations. This is a native Node.js module that provides planetary positions and other astrological data.

## Requirements

- Node.js 18.20.2 or later (LTS recommended)
- npm or yarn package manager
- Build tools (Python, Visual Studio Build Tools on Windows)

## Setup

1. **Install Node.js**
   
   We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) to manage Node.js versions:

   ```bash
   # Install the correct Node.js version
   nvm install 18.20.2
   nvm use
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

   This will automatically rebuild the Swiss Ephemeris native module for your system.

## Troubleshooting

### Node.js Version Mismatch

If you see an error like:

```
The module was compiled against a different Node.js version using NODE_MODULE_VERSION XX
```

1. Ensure you're using the correct Node.js version:
   ```bash
   nvm use
   ```

2. Rebuild the native module:
   ```bash
   npm run rebuild:swisseph
   ```

### Build Tools Required

If you see build errors during installation, you may need to install build tools:

- **Windows**: Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload
- **macOS**: Install Xcode Command Line Tools: `xcode-select --install`
- **Linux**: Install build-essential: `sudo apt-get install build-essential`

## Development

### Checking Ephemeris Status

The application includes a health check endpoint:

```bash
curl http://localhost:3000/api/health/ephemeris
```

### Mock Mode

If the Swiss Ephemeris native module fails to load, the application will automatically fall back to mock data. You'll see a warning in the console:

```
⚠️ Swiss Ephemeris binary not compatible with Node vXX — falling back to mock data.
```

### Rebuilding the Native Module

If you change Node.js versions or encounter issues, rebuild the module:

```bash
npm run rebuild:swisseph
```

## Deployment

The `postinstall` script will automatically rebuild the native module during deployment. Ensure your deployment environment has the required build tools installed.

## License

Swiss Ephemeris is free for non-commercial use. For commercial use, please check the [Swiss Ephemeris license terms](https://www.astro.com/swisseph/).
