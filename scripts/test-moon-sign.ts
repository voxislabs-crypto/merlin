import { utc_to_jd, calc, constants } from 'sweph';

async function testMoonSign() {
  try {
    // Your birth details
    const birthDate = '1983-12-21';
    const birthTime = '12:21';
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = birthTime.split(':').map(Number);
    
    // Norfolk, VA coordinates
    const lat = 36.8508;
    const lon = -76.2859;
    
    // Create Date object in local time
    const localDate = new Date(year, month - 1, day, hours, minutes);
    
    // Convert to UTC
    const utcDate = new Date(
      Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localDate.getHours(),
        localDate.getMinutes()
      )
    );

    // Calculate Julian Day
    const jd = utc_to_jd(
      utcDate.getUTCFullYear(),
      utcDate.getUTCMonth() + 1,
      utcDate.getUTCDate(),
      utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60,
      constants.SE_GREG_CAL
    );

    if (typeof jd !== 'number') {
      throw new Error('Failed to calculate Julian Day');
    }

    console.log('Calculating for:', {
      localDate: localDate.toString(),
      utcDate: utcDate.toISOString(),
      jd
    });

    // Calculate Moon's position
    const moon = calc(jd, constants.SE_MOON, constants.SEFLG_SWIEPH | constants.SEFLG_SPEED);
    
    if (!moon || !moon.data) {
      throw new Error('Failed to calculate Moon position');
    }

    const moonLongitude = moon.data[0];
    const moonSpeed = moon.data[3];
    
    // Calculate zodiac sign
    const ZODIAC_SIGNS = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const signIndex = Math.floor(moonLongitude / 30) % 12;
    const degree = Math.floor(moonLongitude % 30);
    const minutes = Math.floor((moonLongitude % 1) * 60);
    const seconds = Math.floor((((moonLongitude % 1) * 60) % 1) * 60);
    
    console.log('\n=== Moon Position ===');
    console.log(`Longitude: ${moonLongitude.toFixed(6)}°`);
    console.log(`Speed: ${moonSpeed.toFixed(6)}°/day`);
    console.log(`Zodiac: ${ZODIAC_SIGNS[signIndex]} ${degree}° ${minutes}' ${seconds}"`);
    
    // Get house cusps to verify ascendant
    const houses = calc(jd, constants.SE_HSYS_P, constants.SEFLG_SIDEREAL | constants.SEFLG_SWIEPH);
    console.log('\n=== House Cusps ===');
    console.log('Ascendant:', houses?.data?.[0]);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testMoonSign();
