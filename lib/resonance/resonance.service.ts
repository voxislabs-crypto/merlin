import { PrismaClient, type Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: process.env.PRISMA_LOG_QUERIES === 'true' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Default decay rates (per day)
const DEFAULT_DECAY_RATE = 0.95; // 5% decay per day
const DECAY_INTERVAL_DAYS = 1; // Apply decay daily

export interface Feedback {
  userId?: string;
  entityId: string;
  entityType: string;
  score: number; // -1 to 1
  weight?: number;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  ttlDays?: number; // Optional time-to-live in days
}

export interface WeightedScore {
  score: number;
  weight: number;
}

export class ResonanceEngine {
  // Singleton instance
  private static instance: ResonanceEngine;
  
  private constructor() {}
  
  public static getInstance(): ResonanceEngine {
    if (!ResonanceEngine.instance) {
      ResonanceEngine.instance = new ResonanceEngine();
    }
    return ResonanceEngine.instance;
  }

  /**
   * Record user feedback with proper weighting and decay
   */
  async recordFeedback(feedback: Feedback): Promise<void> {
    const { userId, entityId, entityType, score, weight = 1.0, context, metadata, ttlDays } = feedback;

    // Validate score
    if (score < -1 || score > 1) {
      throw new Error('Score must be between -1 and 1');
    }

    // Calculate expiration if TTL is provided
    const expiresAt = ttlDays 
      ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000) 
      : null;

    // Prepare the data with proper typing
    const feedbackData: any = {
      entityId,
      entityType,
      score,
      weight,
      context: context || undefined,
      metadata: metadata || undefined,
      expiresAt,
    };

    // Only add userId if it's provided
    if (userId) {
      feedbackData.userId = userId;
    }

    // Store the feedback
    await prisma.resonanceFeedback.create({
      data: feedbackData,
    });

    // Update weights based on the feedback
    await this.updateWeights({
      userId,
      entityId,
      entityType,
      score,
      weight,
    });
  }

  /**
   * Get the resonance score for an entity, considering all scopes (personal > cluster > global)
   */
  async getResonanceScore(params: {
    userId?: string;
    clusterId?: string;
    entityId: string;
    entityType: string;
  }): Promise<number> {
    const { userId, clusterId, entityId, entityType } = params;
    
    // Get all relevant weights
    const weights = await this.getWeights({
      userId,
      clusterId,
      entityId,
      entityType,
    });

    // Apply weights and calculate final score
    let totalWeight = 0;
    let weightedSum = 0;

    // Personal weights (highest priority)
    if (weights.personal) {
      weightedSum += weights.personal.score * weights.personal.weight;
      totalWeight += weights.personal.weight;
    }

    // Cluster weights (medium priority)
    if (clusterId && weights.cluster) {
      weightedSum += weights.cluster.score * weights.cluster.weight;
      totalWeight += weights.cluster.weight;
    }

    // Global weights (lowest priority)
    if (weights.global) {
      weightedSum += weights.global.score * weights.global.weight;
      totalWeight += weights.global.weight;
    }

    // If no weights found, return neutral score (0)
    if (totalWeight === 0) return 0;

    // Return weighted average
    return weightedSum / totalWeight;
  }

  /**
   * Get weights for all scopes (personal, cluster, global)
   */
  private async getWeights(params: {
    userId?: string;
    clusterId?: string;
    entityId: string;
    entityType: string;
  }): Promise<{
    personal?: WeightedScore;
    cluster?: WeightedScore;
    global?: WeightedScore;
  }> {
    const { userId, clusterId, entityId, entityType } = params;
    const result: {
      personal?: WeightedScore;
      cluster?: WeightedScore;
      global?: WeightedScore;
    } = {};

    // Get all relevant weights in parallel
    const [personalWeight, clusterWeight, globalWeight] = await Promise.all([
      // Personal weight (most specific)
      userId ? this.getEntityWeight({
        scope: 'user',
        scopeId: userId,
        entityId,
        entityType,
      }) : Promise.resolve(null),
      
      // Cluster weight (medium specificity)
      clusterId ? this.getEntityWeight({
        scope: 'cluster',
        scopeId: clusterId,
        entityId,
        entityType,
      }) : Promise.resolve(null),
      
      // Global weight (least specific)
      this.getEntityWeight({
        scope: 'global',
        entityId,
        entityType,
      }),
    ]);

    if (personalWeight) result.personal = personalWeight;
    if (clusterWeight) result.cluster = clusterWeight;
    if (globalWeight) result.global = globalWeight;

    return result;
  }

  /**
   * Get weight for a specific entity and scope
   */
  private async getEntityWeight(params: {
    scope: 'user' | 'cluster' | 'global';
    scopeId?: string;
    entityId: string;
    entityType: string;
  }): Promise<WeightedScore | null> {
    const { scope, scopeId, entityId, entityType } = params;
    
    // Build the where clause
    const where: Prisma.ResonanceWeightWhereInput = {
      scope,
      entityType,
      entityId,
    };
    
    if (scope !== 'global') {
      where.scopeId = scopeId;
    } else {
      where.scopeId = null;
    }

    const weightRecord = await prisma.resonanceWeight.findFirst({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    if (!weightRecord) return null;

    // Apply decay if needed
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - weightRecord.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate > DECAY_INTERVAL_DAYS) {
      const decayFactor = Math.pow(weightRecord.decayRate, Math.floor(daysSinceUpdate / DECAY_INTERVAL_DAYS));
      return {
        score: weightRecord.weight * decayFactor,
        weight: decayFactor, // The weight itself decays
      };
    }

    return {
      score: weightRecord.weight,
      weight: 1.0, // Full weight if no decay
    };
  }

  /**
   * Update weights based on new feedback
   */
  private async updateWeights(params: {
    userId?: string;
    entityId: string;
    entityType: string;
    score: number;
    weight: number;
  }): Promise<void> {
    const { userId, entityId, entityType, score, weight } = params;
    
    // Update weights at all levels
    const updates = [
      // Update global weight
      this.upsertWeight({
        scope: 'global',
        entityId,
        entityType,
        score,
        weight,
      }),
    ];

    // Update user weight if user is provided
    if (userId) {
      updates.push(
        this.upsertWeight({
          scope: 'user',
          scopeId: userId,
          entityId,
          entityType,
          score,
          weight: weight * 2, // Personal feedback has higher weight
        })
      );
    }

    await Promise.all(updates);
  }

  /**
   * Upsert a weight record
   */
  private async upsertWeight(params: {
    scope: 'user' | 'cluster' | 'global';
    scopeId?: string;
    entityId: string;
    entityType: string;
    score: number;
    weight: number;
  }): Promise<void> {
    const { scope, scopeId, entityId, entityType, score, weight } = params;
    
    // Calculate new weight using exponential moving average
    const existing = await prisma.resonanceWeight.findFirst({
      where: {
        scope,
        scopeId: scope === 'global' ? null : scopeId,
        entityType,
        entityId,
      },
    });

    const learningRate = 0.1; // How quickly to adapt to new information
    const newWeight = existing
      ? existing.weight * (1 - learningRate) + score * learningRate * weight
      : score * weight;

    // Upsert the weight
    await prisma.resonanceWeight.upsert({
      where: {
        id: existing?.id || uuidv4(),
      },
      update: {
        weight: newWeight,
        decayRate: DEFAULT_DECAY_RATE,
      },
      create: {
        id: uuidv4(),
        scope,
        scopeId: scope === 'global' ? null : scopeId,
        entityType,
        entityId,
        weight: newWeight,
        decayRate: DEFAULT_DECAY_RATE,
      },
    });
  }

  /**
   * Clean up expired feedback
   */
  async cleanupExpiredFeedback(): Promise<number> {
    const result = await prisma.resonanceFeedback.deleteMany({
      where: {
        expiresAt: {
          not: null,
          lt: new Date(),
        },
      },
    });
    
    return result.count;
  }

  /**
   * Apply decay to all weights
   */
  async applyDecay(): Promise<void> {
    // This would be called periodically (e.g., daily) to apply decay to all weights
    await prisma.$executeRaw`
      UPDATE resonance_weights 
      SET weight = weight * POW(decay_rate, 1.0/365.0),
          updated_at = NOW()
      WHERE updated_at < NOW() - INTERVAL '1 day';
    `;
  }
}

// Export a singleton instance with proper typing
const resonanceEngine = ResonanceEngine.getInstance();

// Export the instance with the interface it implements
export { resonanceEngine };

declare global {
  // Augment the global scope with the resonance engine type
  interface Global {
    resonanceEngine: typeof ResonanceEngine;
  }
}

// Make the instance available globally in Node.js
if (typeof global !== 'undefined') {
  (global as any).resonanceEngine = resonanceEngine;
}

// Export types for external use
export type { Feedback as IFeedback, WeightedScore as IWeightedScore };

export interface IResonanceEngine {
  recordFeedback(feedback: Feedback): Promise<void>;
  getResonanceScore(params: {
    userId?: string;
    clusterId?: string;
    entityId: string;
    entityType: string;
  }): Promise<number>;
  getClusterResonance(userId: string): Promise<number>;
  getGlobalResonance(): Promise<number>;
  cleanupExpiredFeedback(): Promise<number>;
  applyDecay(): Promise<void>;
}
