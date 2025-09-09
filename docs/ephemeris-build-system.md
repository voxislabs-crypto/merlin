# Swiss Ephemeris Build System

This document explains how the Swiss Ephemeris native module is built and verified in the Merlin project.

## Overview

The system ensures that the Swiss Ephemeris native module is properly built for the target environment and provides clear feedback about its status.

## Key Components

### 1. Build Process

- **Postinstall Hook**: Automatically runs `npm rebuild swisseph --update-binary` after `npm install`
- **CI/CD Pipeline**: Explicitly rebuilds the module during deployment
- **Fallback**: Gracefully falls back to mock data if the native module cannot be built

### 2. Health Verification

- **Health Check Script**: `scripts/test-ephemeris.ts` verifies if the native module is working
- **CI/CD Integration**: Fails the build if:
  - The module fails to build
  - Health check fails in production (main branch)
  - Mock mode is detected in production (unless explicitly allowed)

## Environment Variables

- `ALLOW_MOCK_MODE`:
  - `true`: Allows the build to proceed even if the native module is not available
  - `false` (default in production): Fails the build if the native module is not available

## Development Workflow

### Local Development

```bash
# Check status (warns but doesn't fail)
npm run test:ephemeris

# Force real mode (will fail if not available)
$env:ALLOW_MOCK_MODE="false"; npm run test:ephemeris
```

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ephemeris-check.yml`):

1. Checks out the code
2. Sets up Node.js using the version specified in `.nvmrc`
3. Installs dependencies
4. Rebuilds the Swiss Ephemeris module
5. Runs health checks
6. Fails the build if:
   - The module fails to build in production
   - Health check fails in production
   - Mock mode is detected in production (unless allowed)

## Troubleshooting

### Common Issues

1. **Module Build Failure**:
   - Ensure Node.js version matches `.nvmrc`
   - Check build logs in CI artifacts
   - Try deleting `node_modules` and `package-lock.json`, then reinstall

2. **Health Check Failures**:
   - Check the health check output for specific errors
   - Verify the ephemeris data files are accessible
   - Check system architecture compatibility

### Logs

- Build logs are available in the GitHub Actions artifacts
- Additional debug information can be found in `.next/*.log` files

## Best Practices

- Always commit the `package-lock.json` file
- Keep `.nvmrc` updated with the tested Node.js version
- Test with `ALLOW_MOCK_MODE=false` before releasing to production
- Monitor build logs for any warnings about the Swiss Ephemeris module
