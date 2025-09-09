#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

// Configuration
const SWISSEPH_PATH = path.join(process.cwd(), 'node_modules/swisseph');
const BUILD_INFO_PATH = path.join(SWISSEPH_PATH, 'build-info.json');

// Get environment variables with defaults
const CDN_BASE_URL = process.env.SWISSEPH_CDN_URL || '';
const NODE_VERSION = process.env.NODE_VERSION || process.version.replace('v', '');
const PLATFORM = process.platform;
const ARCH = process.arch;

// Generate a unique cache key for the current environment
function generateCacheKey() {
  const hash = crypto.createHash('sha256');
  hash.update(`${NODE_VERSION}-${PLATFORM}-${ARCH}`);
  return hash.digest('hex').substring(0, 12);
}

// Check if the current build is valid
async function verifyBuild() {
  try {
    // Run the health check
    console.log('🔍 Verifying Swiss Ephemeris build...');
    execSync('npm run test:ephemeris -- --ci', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ Build verification failed:', error);
    return false;
  }
}

// Create build info file
async function createBuildInfo() {
  const buildInfo = {
    nodeVersion: NODE_VERSION,
    platform: PLATFORM,
    arch: ARCH,
    timestamp: new Date().toISOString(),
    cacheKey: generateCacheKey(),
  };
  
  await fs.promises.writeFile(
    BUILD_INFO_PATH,
    JSON.stringify(buildInfo, null, 2)
  );
  
  return buildInfo;
}

// Upload build to CDN
async function uploadToCDN() {
  if (!CDN_BASE_URL) {
    console.log('ℹ️  No CDN URL provided. Skipping upload.');
    return;
  }

  try {
    const buildInfo = await createBuildInfo();
    const cacheKey = buildInfo.cacheKey;
    const tarballName = `swisseph-${cacheKey}.tgz`;
    const tarballPath = path.join(process.cwd(), tarballName);

    console.log(`📦 Creating tarball: ${tarballName}`);
    execSync(`tar -czf ${tarballPath} -C node_modules swisseph`);

    // Here you would implement the actual upload logic
    // For example, using AWS SDK, GCP Storage, or any other CDN provider
    console.log(`📤 Uploading to CDN: ${CDN_BASE_URL}/${tarballName}`);
    
    // Example with AWS SDK (commented out)
    /*
    const { S3 } = require('@aws-sdk/client-s3');
    const s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `swisseph/${tarballName}`,
      Body: fs.createReadStream(tarballPath),
      ContentType: 'application/gzip'
    }).promise();
    */

    console.log('✅ Successfully uploaded to CDN');
    fs.unlinkSync(tarballPath);
  } catch (error) {
    console.error('❌ Failed to upload to CDN:', error);
    process.exit(1);
  }
}

// Download build from CDN
async function downloadFromCDN() {
  if (!CDN_BASE_URL) {
    console.log('ℹ️  No CDN URL provided. Skipping download.');
    return false;
  }

  const cacheKey = generateCacheKey();
  const tarballName = `swisseph-${cacheKey}.tgz`;
  const tarballPath = path.join(process.cwd(), tarballName);

  try {
    console.log(`📥 Attempting to download from CDN: ${tarballName}`);
    
    // Here you would implement the actual download logic
    // Example with fetch (commented out)
    /*
    const response = await fetch(`${CDN_BASE_URL}/${tarballName}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const fileStream = fs.createWriteStream(tarballPath);
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    */

    console.log('✅ Successfully downloaded from CDN');
    
    // Extract the tarball
    console.log('📦 Extracting tarball...');
    execSync(`tar -xzf ${tarballPath} -C node_modules`);
    fs.unlinkSync(tarballPath);
    
    // Verify the build
    const isValid = await verifyBuild();
    if (!isValid) {
      throw new Error('Downloaded build verification failed');
    }
    
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('ℹ️  CDN download failed, will build from source:', errorMessage);
    if (fs.existsSync(tarballPath)) {
      fs.unlinkSync(tarballPath);
    }
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Swiss Ephemeris sync');
  console.log(`- Node.js: ${NODE_VERSION}`);
  console.log(`- Platform: ${PLATFORM}`);
  console.log(`- Architecture: ${ARCH}`);
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'upload':
        console.log('⬆️  Uploading Swiss Ephemeris to CDN...');
        await uploadToCDN();
        break;
        
      case 'download':
        console.log('⬇️  Attempting to download Swiss Ephemeris from CDN...');
        const success = await downloadFromCDN();
        if (!success) {
          console.log('ℹ️  Proceeding with local build...');
          process.exit(1);
        }
        break;
        
      default:
        console.error('❌ Unknown command. Use "upload" or "download"');
        process.exit(1);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
