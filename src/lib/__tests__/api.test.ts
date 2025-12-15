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
