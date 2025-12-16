// Test script to verify Norfolk 1983 Moon calculation
// Expected: Moon in Scorpio (~211° longitude)

async function testNorfolk1983() {
  try {
    console.log('Testing Norfolk 1983-08-14 16:21 EDT...');
    
    const response = await fetch('http://localhost:3000/api/calculate-signs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate: '1983-08-14',
        birthTime: '16:21',
        birthLocation: 'Norfolk, VA',
        timeUnknown: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('\n=== TEST RESULTS ===');
    console.log('Moon Sign:', result.moonSign);
    console.log('Rising Sign:', result.risingSign);
    console.log('Coordinates:', result.coordinates);
    
    // Check if Moon is in Scorpio (210-240°)
    console.log('\n=== VERIFICATION ===');
    console.log('Expected: Moon in Scorpio (~211° longitude)');
    console.log('Actual:', result.moonSign);
    
    if (result.moonSign === 'Scorpio') {
      console.log('✅ SUCCESS: Moon correctly calculated as Scorpio');
    } else {
      console.log('❌ FAILED: Expected Scorpio but got', result.moonSign);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test
testNorfolk1983();
