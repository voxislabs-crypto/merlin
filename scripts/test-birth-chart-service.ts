import { PrismaClient } from '@prisma/client';
import { BirthChartService } from '../lib/services/birth-chart-service.js';

const prisma = new PrismaClient();

async function testBirthChartService() {
  try {
    // Test user ID - replace with an actual user ID from your database
    const testUserId = 'test-user-id';
    
    // Test birth chart data
    const testBirthData = {
      birthDate: '1990-01-01',
      birthTime: '12:00',
      birthLocation: 'New York, NY',
      timeUnknown: false,
      latitude: 40.7128,
      longitude: -74.0060
    };

    const testChartData = {
      planets: [
        { name: 'Sun', longitude: 10.5, latitude: 0, sign: 'Aries', house: 1, degree: 10, minute: 30 },
        { name: 'Moon', longitude: 120.75, latitude: 0, sign: 'Leo', house: 5, degree: 0, minute: 45 }
      ],
      houses: [
        { house: 1, position: 0, sign: 'Aries', degree: 10, cuspLongitude: 10.5 },
        { house: 2, position: 30, sign: 'Taurus', degree: 5, cuspLongitude: 35.5 }
      ],
      aspects: [
        {
          planet1: { name: 'Sun', longitude: 10.5 },
          planet2: { name: 'Moon', longitude: 120.75 },
          type: 'trine',
          orb: 0.75,
          exact: false
        }
      ],
      metadata: {
        julianDay: 2451545.0,
        location: { lat: 40.7128, lon: -74.0060 },
        timezone: 'America/New_York'
      }
    };

    console.log('Testing BirthChartService...');

    // 1. Test creating a birth chart
    console.log('\n1. Creating a birth chart...');
    const createdChart = await BirthChartService.upsertBirthChart(
      undefined, // No ID for new chart
      testUserId,
      testBirthData,
      testChartData
    );
    console.log('Created chart:', createdChart);

    // 2. Test getting the birth chart by ID
    console.log('\n2. Getting birth chart by ID...');
    const fetchedChart = await BirthChartService.getBirthChart(createdChart.id, testUserId);
    console.log('Fetched chart:', fetchedChart);

    // 3. Test getting all charts for user
    console.log('\n3. Getting all charts for user...');
    const userCharts = await BirthChartService.getUserBirthCharts(testUserId);
    console.log(`User has ${userCharts.length} charts`);

    // 4. Test setting default chart
    console.log('\n4. Setting default chart...');
    await BirthChartService.setDefaultBirthChart(testUserId, createdChart.id);
    console.log('Default chart set');

    // 5. Test getting default chart
    console.log('\n5. Getting default chart...');
    const defaultChart = await BirthChartService.getDefaultBirthChart(testUserId);
    console.log('Default chart:', defaultChart);

    // 6. Test checking if chart exists
    console.log('\n6. Checking if chart exists...');
    const chartExists = await BirthChartService.birthChartExists(testUserId, testBirthData);
    console.log('Chart exists:', chartExists);

    // 7. Test deleting the chart
    console.log('\n7. Deleting chart...');
    const deleteResult = await BirthChartService.deleteBirthChart(createdChart.id, testUserId);
    console.log('Delete result:', deleteResult);

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testBirthChartService();
