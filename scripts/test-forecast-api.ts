// @ts-check

// This script tests the ephemeris functionality directly
import { getAllPositions } from '../lib/ephemeris.js';

async function testForecastAPI() {
  try {
    console.log('Testing forecast API...');
    
    // Test with current date and New York coordinates
    const date = new Date();
    const lat = 40.7128;
    const lon = -74.0060;
    
    console.log(`Fetching positions for ${date.toISOString()} at (${lat}, ${lon})`);
    
    // Call the API directly
    const positions = await getAllPositions(date, lat, lon);
    
    console.log('Successfully retrieved positions:');
    Object.entries(positions).forEach(([planet, position]) => {
      console.log(`- ${planet}: ${position.longitude.toFixed(4)}° (${position.signName} ${position.degree}°${position.minute}'${position.second}")`);
    });
    
    return 'Test completed successfully';
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Run the test
async function main() {
  try {
    const result = await testForecastAPI();
    console.log(result);
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();
