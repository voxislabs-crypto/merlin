# create-test-files.ps1
# Run this script to create test files for the ephemeris implementation

# Create test directory if it doesn't exist
$testDir = "x:\Merlin Project\src\lib\__tests__"
if (-not (Test-Path $testDir)) {
    New-Item -ItemType Directory -Path $testDir
}

# Create ephemeris.test.ts
@"
// ephemeris.test.ts
import { 
    ephemeris, 
    getPlanetaryPositions, 
    checkEphemerisHealth,
    formatCoordinates,
    toDegreesMinutesSeconds
} from '../ephemeris';

describe('Ephemeris', () => {
    beforeAll(() => {
        // Mock any required globals or modules
    });

    describe('formatCoordinates', () => {
        it('should format coordinates correctly', () => {
            // 30.5 degrees = 30°30'00"
            const result = formatCoordinates(30.5);
            expect(result.sign).toBe(0); // Aries
            expect(result.signName).toBe('Aries');
            expect(result.degree).toBe(0);
            expect(result.minute).toBe(30);
            expect(result.second).toBe(0);
        });
    });

    describe('toDegreesMinutesSeconds', () => {
        it('should convert decimal degrees to DMS string', () => {
            const result = toDegreesMinutesSeconds(30.5);
            expect(result).toBe("30°30'0\" Aries");
        });
    });

    describe('getPlanetaryPositions', () => {
        it('should return planetary positions for a given date', async () => {
            const date = new Date();
            const result = await getPlanetaryPositions({
                date,
                latitude: 40.7128,
                longitude: -74.0060
            });

            expect(result).toHaveProperty('positions');
            expect(result.timestamp).toBeInstanceOf(Date);
            expect(['swiss-ephemeris', 'mock']).toContain(result.source);
        });
    });

    describe('checkEphemerisHealth', () => {
        it('should return health status', async () => {
            const health = await checkEphemerisHealth();
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('swissEphemerisAvailable');
            expect(health).toHaveProperty('environment');
        });
    });
});
"@ | Out-File -FilePath "$testDir\ephemeris.test.ts" -Encoding utf8

# Create api.test.ts
@"
// api.test.ts
import { NextRequest } from 'next/server';
import { GET as healthCheck } from '../../../app/api/health/ephemeris/route';
import { GET as forecast } from '../../../app/api/forecast/route';

describe('API Routes', () => {
    describe('GET /api/health/ephemeris', () => {
        it('should return health status', async () => {
            const response = await healthCheck();
            const data = await response.json();
            
            expect(data).toHaveProperty('mode');
            expect(data).toHaveProperty('nodeVersion');
            expect(data).toHaveProperty('details');
        });
    });

    describe('GET /api/forecast', () => {
        it('should return forecast data', async () => {
            const url = new URL('http://localhost/api/forecast');
            url.searchParams.append('lat', '40.7128');
            url.searchParams.append('lon', '-74.0060');
            
            const request = new NextRequest(url);
            const response = await forecast(request);
            const data = await response.json();
            
            expect(data).toHaveProperty('data');
            expect(data).toHaveProperty('timestamp');
            expect(data).toHaveProperty('source');
        });
    });
});
"@ | Out-File -FilePath "$testDir\api.test.ts" -Encoding utf8

Write-Host "Test files created successfully in $testDir"
Write-Host "Run tests with: npm test"