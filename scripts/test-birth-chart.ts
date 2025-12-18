// Test script for birth chart API
// Run with: tsx scripts/test-birth-chart.ts

interface BirthChartRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timeUnknown: boolean;
}

async function testBirthChartAPI() {
  const testData: BirthChartRequest = {
    birthDate: '1990-06-15',
    birthTime: '14:30',
    birthLocation: 'New York',
    timeUnknown: false
  };

  try {
    const response = await fetch('http://localhost:3000/api/birth-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('Birth Chart API Test Results:');
    console.log('=============================');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    
    if (result.success && result.data) {
      console.log('\nPlanets:');
      result.data.planets.forEach((planet: any) => {
        console.log(`${planet.name}: ${planet.sign} ${planet.longitude.toFixed(2)}° (House ${planet.house}) ${planet.retrograde ? '(R)' : ''}`);
      });
      
      console.log('\nAscendant:', `${result.data.ascendant.sign} ${result.data.ascendant.longitude.toFixed(2)}°`);
      console.log('Midheaven:', `${result.data.midheaven.sign} ${result.data.midheaven.longitude.toFixed(2)}°`);
      
      console.log('\nMajor Aspects:');
      result.data.aspects.slice(0, 5).forEach((aspect: any) => {
        console.log(`${aspect.planet1} ${aspect.type} ${aspect.planet2} (${aspect.orb}°)`);
      });
    } else {
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

if (require.main === module) {
  testBirthChartAPI();
}

export { testBirthChartAPI };
