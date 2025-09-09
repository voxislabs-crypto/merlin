#!/usr/bin/env node

async function main() {
  // Use dynamic import for better compatibility
  const { getEphemerisStatus } = await import('../lib/ephemeris-health');
  const status = getEphemerisStatus();
  const allowMock = process.env.ALLOW_MOCK_MODE === 'true';
  
  console.log('🔍 Swiss Ephemeris Health Check');
  console.log('----------------------------');
  console.log(`• Mode: ${status.mode.toUpperCase()}`);
  console.log(`• Node Version: ${status.nodeVersion}`);
  console.log(`• Last Check: ${status.lastCheck}`);
  console.log(`• Details: ${status.details}`);
  console.log(`• Allow Mock Mode: ${allowMock}`);
  
  if (status.mode === 'mock') {
    const message = '⚠️  WARNING: Swiss Ephemeris is running in MOCK mode.';
    if (!allowMock) {
      console.error('\x1b[31m%s\x1b[0m', `❌ ${message} Failing build.`);
      console.log('\nTo allow mock mode in development, set ALLOW_MOCK_MODE=true');
      process.exit(1);
    }
    console.warn('\x1b[33m%s\x1b[0m', `⚠️  ${message} Continuing because ALLOW_MOCK_MODE=true`);
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✅ Swiss Ephemeris is active and healthy.');
  }
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error running health check:', error);
  process.exit(1);
});
