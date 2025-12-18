import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BirthChartData {
  planets: Array<{
    name: string;
    longitude: number;
    latitude: number;
    speed: number;
    sign: string;
    house: number;
    retrograde: boolean;
  }>;
  houses: Array<{
    number: number;
    cuspLongitude: number;
    sign: string;
  }>;
  ascendant: {
    name: string;
    longitude: number;
    latitude: number;
    speed: number;
    sign: string;
    house: number;
    retrograde: boolean;
  };
  midheaven: {
    name: string;
    longitude: number;
    latitude: number;
    speed: number;
    sign: string;
    house: number;
    retrograde: boolean;
  };
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    angle: number;
  }>;
  metadata: {
    julianDay: number;
    location: { lat: number; lon: number };
    timezone: string;
  };
}

export interface BirthChartRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timeUnknown: boolean;
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
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get the default birth chart for a user
   */
  static async getDefaultBirthChart(userId: string) {
    // First check if user has a default birth chart
    const userProfile = await prisma.userProfile.findUnique({
      where: {
        userId,
      },
      include: {
        defaultBirthChart: true,
      },
    });

    if (userProfile?.defaultBirthChart) {
      return userProfile.defaultBirthChart;
    }

    // If no default is set, return the most recent birth chart
    const charts = await this.getUserBirthCharts(userId);
    return charts.length > 0 ? charts[0] : null;
  }

  /**
   * Create or update a birth chart
   */
  static async upsertBirthChart(
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
        birthDate,
        birthLocation: birthData.birthLocation,
        birthTime: birthData.birthTime || null,
      },
    });

    if (existingChart) {
      // Update existing chart
      return await prisma.birthChart.update({
        where: {
          id: existingChart.id,
        },
        data: {
          chartData,
          timezone,
        },
      });
    } else {
      // Create new chart
      const newChart = await prisma.birthChart.create({
        data: {
          userId,
          birthDate,
          birthTime: birthData.birthTime || null,
          birthLocation: birthData.birthLocation,
          chartData,
          timezone,
          isDefault: false,
        },
      });

      // If this is the user's first birth chart, make it the default
      const chartCount = await prisma.birthChart.count({
        where: {
          userId,
        },
      });

      if (chartCount === 1) {
        await this.setDefaultBirthChart(userId, newChart.id);
      }

      return newChart;
    }
  }

  /**
   * Set a birth chart as default for a user
   */
  static async setDefaultBirthChart(userId: string, birthChartId: string): Promise<void> {
    // Update user profile
    await prisma.userProfile.upsert({
      where: {
        userId,
      },
      update: {
        defaultBirthChartId: birthChartId,
      },
      create: {
        userId,
        defaultBirthChartId: birthChartId,
      },
    });

    // Update the birth chart to mark it as default
    await prisma.birthChart.updateMany({
      where: {
        userId,
        id: {
          not: birthChartId,
        },
      },
      data: {
        isDefault: false,
      },
    });

    await prisma.birthChart.update({
      where: {
        id: birthChartId,
      },
      data: {
        isDefault: true,
      },
    });
  }

  /**
   * Delete a birth chart
   */
  static async deleteBirthChart(id: string, userId: string): Promise<void> {
    const chart = await prisma.birthChart.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!chart) {
      throw new Error('Birth chart not found');
    }

    // If this was the default chart, update the user profile
    if (chart.isDefault) {
      await prisma.userProfile.update({
        where: {
          userId,
        },
        data: {
          defaultBirthChartId: null,
        },
      });

      // Set the most recent remaining chart as default if any exist
      const remainingCharts = await this.getUserBirthCharts(userId);
      if (remainingCharts.length > 0) {
        await this.setDefaultBirthChart(userId, remainingCharts[0].id);
      }
    }

    // Delete the chart
    await prisma.birthChart.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Check if a birth chart already exists for the given birth data
   */
  static async birthChartExists(
    userId: string,
    birthData: BirthChartRequest
  ) {
    const birthDate = new Date(birthData.birthDate);
    
    return await prisma.birthChart.findFirst({
      where: {
        userId,
        birthDate,
        birthLocation: birthData.birthLocation,
        birthTime: birthData.birthTime || null,
      },
    });
  }
}
