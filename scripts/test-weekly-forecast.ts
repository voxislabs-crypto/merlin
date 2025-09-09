// Test script for the weekly forecast API
import { getWeeklyForecast } from '../lib/forecast-engine.js';

async function testWeeklyForecast() {
  console.log('Testing weekly forecast generation...');
  
  const startDate = new Date();
  const location = {
    latitude: 40.7128, // New York
    longitude: -74.0060
  };
  
  try {
    console.log(`Generating 7-day forecast starting from ${startDate.toISOString().split('T')[0]}`);
    
    const forecast = await getWeeklyForecast(startDate, location, { days: 7 });
    
    console.log('\nWeekly Forecast Summary:');
    console.log('---------------------');
    
    forecast.forEach((day, index) => {
      const dateStr = day.date.toISOString().split('T')[0];
      console.log(`\nDay ${index + 1} (${dateStr}):`);
      console.log(`- Primary Theme: ${day.primaryTheme}`);
      console.log(`- Supporting Themes: ${day.supportingThemes.join(', ')}`);
      console.log(`- Aspects: ${day.aspects.length} total`);
      console.log(`- Confidence: ${(day.confidence * 100).toFixed(1)}%`);
      console.log(`- Resonance: ${day.resonanceStats.positive} positive, ${day.resonanceStats.negative} negative, ${day.resonanceStats.neutral} neutral`);
    });
    
    console.log('\n✅ Weekly forecast test completed successfully');
  } catch (error) {
    console.error('❌ Error testing weekly forecast:', error);
    process.exit(1);
  }
}

// Run the test
testWeeklyForecast().catch(console.error);
