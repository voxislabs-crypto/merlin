import { PrismaClient, Prisma } from '@prisma/client';

// Create a singleton Prisma client with correct types
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

// Type definitions
export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  speed?: number;
  sign: string;
  house: number;
  retrograde?: boolean;
  degree?: number;
  minute?: number;
  second?: number;
}

export interface HousePosition {
  house: number;
  position: number;
  sign: string;
  degree: number;
  minute?: number;
  second?: number;
  cuspLongitude?: number;
}

export interface Aspect {
  planet1: { name: string; longitude: number };
  planet2: { name: string; longitude: number };
  type: string;
  orb: number;
  exact: boolean;
  angle?: number;
  meaning?: Record<string, any>;
}

export interface BirthChartData {
  planets: PlanetPosition[];
  houses: HousePosition[];
  aspects?: Aspect[];
  ascendant?: PlanetPosition;
  midheaven?: PlanetPosition;
  metadata?: {
    julianDay: number;
    location: { lat: number; lon: number };
    timezone: string;
  };
}

export interface BirthChartRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timeUnknown?: boolean;
  latitude?: number;
  longitude?: number;
}

export class BirthChartService {
  /**
   * Get a birth chart by ID
   */
  static async getBirthChart(id: string, userId: string) {
    return await prisma.birthChart.findUnique({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * Get all birth charts for a user
   */
  static async getUserBirthCharts(userId: string) {
    return await prisma.birthChart.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get the default birth chart for a user
   */
  static async getDefaultBirthChart(userId: string) {
    // First try to find a default chart by checking the user's defaultChartId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        birthCharts: { 
          where: { 
            isDefault: true 
          }, 
          take: 1 
        } 
      }
    });

    if (user?.birthCharts?.[0]) {
      return user.birthCharts[0];
    }

    // If no default set, return the most recent chart
    const charts = await this.getUserBirthCharts(userId);
    return charts[0] || null;
  }

  /**
   * Create or update a birth chart
   */
  static async upsertBirthChart(
    id: string | undefined,
    userId: string,
    birthData: BirthChartRequest,
    chartData: BirthChartData,
    timezone?: string
  ) {
    // Parse birth date
    const birthDate = new Date(birthData.birthDate);
    
    // Check if a birth chart with the same birth data already exists
    const existingChart = await prisma.birthChart.findFirst({
      where: {
        userId,
        birthDate: new Date(birthData.birthDate),
        birthTime: birthData.birthTime || null,
      } as any, // Using type assertion to bypass TypeScript error
    });

    if (existingChart && existingChart.id !== id) {
      throw new Error('Birth chart with same birth data already exists');
    }

    // Convert data to JSON for storage
    const chartDataInput: any = {
      birthDate: new Date(birthData.birthDate),
      birthTime: birthData.birthTime,
      birthLocation: birthData.birthLocation,
      timeUnknown: birthData.timeUnknown || false,
      latitude: birthData.latitude ?? 0,
      longitude: birthData.longitude ?? 0,
      planets: JSON.parse(JSON.stringify(chartData.planets)),
      houses: JSON.parse(JSON.stringify(chartData.houses)),
      aspects: chartData.aspects ? JSON.parse(JSON.stringify(chartData.aspects)) : null,
      chartData: JSON.parse(JSON.stringify(chartData)),
      julianDay: chartData.metadata?.julianDay || null,
      user: { connect: { id: userId } },
    };

    if (id) {
      // Update existing chart
      return await prisma.birthChart.update({
        where: { id },
        data: chartDataInput,
      });
    } else {
      // Create new chart - Prisma will handle the relation via the user connect
      const chart = await prisma.birthChart.create({
        data: chartDataInput as Prisma.BirthChartCreateInput,
      });

      return chart;
    }
  }

  /**
   * Set a birth chart as default for a user
   */
  static async setDefaultBirthChart(userId: string, birthChartId: string): Promise<void> {
    // Update user's default chart ID
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "defaultChartId" = ${birthChartId}
      WHERE "id" = ${userId}
    `;
    
    // Update all charts to not be default (redundant but ensures consistency)
    await prisma.$executeRaw`
      UPDATE "BirthChart" 
      SET "isDefault" = false 
      WHERE "userId" = ${userId} AND "isDefault" = true
    `;
    
    // Set the selected chart as default using raw query to bypass TypeScript issues
    await prisma.$executeRaw`
      UPDATE "BirthChart" 
      SET "isDefault" = true 
      WHERE "id" = ${birthChartId}
    `;
  }

  /**
   * Delete a birth chart
   */
  static async deleteBirthChart(id: string, userId: string): Promise<boolean> {
    const chart = await prisma.birthChart.findUnique({
      where: { id, userId },
    });

    if (!chart) {
      throw new Error('Birth chart not found');
    }

    // If this is the default chart, we need to clear the user's defaultChartId
    const user = await prisma.$queryRaw`
      SELECT "defaultChartId" 
      FROM "User" 
      WHERE "id" = ${userId}
    `;
    
    if (user?.defaultChartId === id) {
      // Clear the default chart ID
      await prisma.$executeRaw`
        UPDATE "User" 
        SET "defaultChartId" = NULL
        WHERE "id" = ${userId}
      `;
      
      // Optionally set another chart as default
      const otherChart = await prisma.$queryRaw`
        SELECT * FROM "BirthChart" 
        WHERE "userId" = ${userId} 
        AND "id" != ${id}
        AND "isDefault" = true
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;

      if (otherChart && otherChart[0]?.id) {
        await this.setDefaultBirthChart(userId, otherChart[0].id);
      }
    }

    // Delete the chart
    await prisma.birthChart.delete({ where: { id } });
    return true;
  }

  /**
   * Check if a birth chart exists with the given data
   */
  static async birthChartExists(userId: string, birthData: BirthChartRequest): Promise<boolean> {
    // Convert birth date to start and end of day for comparison
    const birthDate = new Date(birthData.birthDate);
    const startOfDay = new Date(birthDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(birthDate.setHours(23, 59, 59, 999));
    
    const count = await prisma.birthChart.count({
      where: {
        userId,
        birthDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        ...(birthData.birthTime && { birthTime: birthData.birthTime })
      },
    });
    
    return count > 0;
  }
}
