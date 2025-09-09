# CDN Configuration for Swiss Ephemeris

This document explains how to configure the CDN for Swiss Ephemeris binaries to speed up builds and deployments.

## Overview

The system can cache and share prebuilt Swiss Ephemeris binaries via a CDN, which significantly speeds up CI/CD pipelines and ensures consistent builds across different environments.

## Supported CDN Providers

The system is designed to work with any object storage service that provides an S3-compatible API, including:

- AWS S3
- Google Cloud Storage
- Cloudflare R2
- MinIO
- Any S3-compatible storage

## Configuration

### Environment Variables

Set these environment variables in your CI/CD system:

```bash
# Required: Base URL of your CDN (e.g., https://your-cdn.example.com)
SWISSEPH_CDN_URL=your-cdn-base-url

# For S3-compatible storage (if using AWS SDK)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
AWS_S3_BUCKET=your-bucket-name
```

### GitHub Secrets

For GitHub Actions, add these as repository secrets:

1. Go to your repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add the environment variables listed above

## How It Works

1. **Build Process**:
   - The system checks if a prebuilt binary exists in the CDN for the current environment
   - If found, it downloads and uses the binary
   - If not found, it builds the binary locally and optionally uploads it to the CDN

2. **Caching**:
   - Binaries are cached based on:
     - Node.js version
     - Platform (Linux, macOS, Windows)
     - Architecture (x64, arm64, etc.)
     - Package dependencies (from package-lock.json)

3. **Fallback**:
   - If CDN access fails, the system falls back to local building
   - Builds continue to work even without CDN access

## Manual Operations

### Upload a Binary to CDN

```bash
npm run sync-ephemeris -- upload
```

### Download a Binary from CDN

```bash
npm run sync-ephemeris -- download
```

## Troubleshooting

### Common Issues

1. **CDN Access Denied**
   - Verify your AWS credentials or access tokens
   - Check bucket policies and IAM permissions

2. **Binary Not Found**
   - Ensure the binary was built with the same Node.js version and platform
   - Check if the upload was successful

3. **Build Failures**
   - Check network connectivity to the CDN
   - Verify the CDN URL is correct
   - Check storage permissions

## Security Considerations

1. **Access Control**:
   - Use read-only credentials for CI/CD environments
   - Restrict write access to trusted environments only

2. **Secrets Management**:
   - Never commit credentials to version control
   - Use environment variables or secret management systems

3. **Binary Verification**:
   - Consider adding checksum verification for downloaded binaries
   - Only download from trusted sources
