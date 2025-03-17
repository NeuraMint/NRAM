import axios from 'axios';
import { Memory } from '../types/memory';

/**
 * Service for analyzing memory data and providing insights
 */
export class AnalyticsService {
  /**
   * Analyze memory quality distribution
   * @param memories Array of memories to analyze
   * @returns Distribution of memories by quality tier
   */
  static getQualityDistribution(memories: Memory[]) {
    const distribution = {
      common: 0,
      fine: 0,
      excellent: 0,
      legendary: 0,
    };

    memories.forEach((memory) => {
      if (memory.quality === 1) distribution.common++;
      else if (memory.quality === 2) distribution.fine++;
      else if (memory.quality === 3) distribution.excellent++;
      else if (memory.quality === 4) distribution.legendary++;
    });

    return {
      labels: ['Common', 'Fine', 'Excellent', 'Legendary'],
      data: [
        distribution.common,
        distribution.fine,
        distribution.excellent,
        distribution.legendary,
      ],
      percentages: {
        common: memories.length ? (distribution.common / memories.length) * 100 : 0,
        fine: memories.length ? (distribution.fine / memories.length) * 100 : 0,
        excellent: memories.length ? (distribution.excellent / memories.length) * 100 : 0,
        legendary: memories.length ? (distribution.legendary / memories.length) * 100 : 0,
      },
    };
  }

  /**
   * Analyze memory type distribution
   * @param memories Array of memories to analyze
   * @returns Distribution of memories by type
   */
  static getTypeDistribution(memories: Memory[]) {
    const distribution = {
      cognitive: 0,
      emotional: 0,
      cultural: 0,
      therapeutic: 0,
    };

    memories.forEach((memory) => {
      const type = memory.memoryType?.toLowerCase() || '';
      if (type.includes('cognitive')) distribution.cognitive++;
      else if (type.includes('emotional')) distribution.emotional++;
      else if (type.includes('cultural')) distribution.cultural++;
      else if (type.includes('therapeutic')) distribution.therapeutic++;
    });

    return {
      labels: ['Cognitive', 'Emotional', 'Cultural', 'Therapeutic'],
      data: [
        distribution.cognitive,
        distribution.emotional,
        distribution.cultural,
        distribution.therapeutic,
      ],
    };
  }

  /**
   * Calculate estimated value based on rarity and market trends
   * @param memory Memory to evaluate
   * @param recentSales Array of recent sales for price reference
   * @returns Estimated value range
   */
  static getEstimatedValue(memory: Memory, recentSales: any[] = []) {
    // Base value multipliers by quality
    const qualityMultipliers = {
      1: 1,     // Common
      2: 2.5,   // Fine
      3: 6,     // Excellent
      4: 15,    // Legendary
    };

    // Base price
    const basePrice = 0.05; // SOL
    
    // Apply quality multiplier
    const qualityMultiplier = qualityMultipliers[memory.quality] || 1;
    
    // Calculate median price from recent sales of same quality if available
    let marketAdjustment = 1;
    const similarQualitySales = recentSales.filter(sale => sale.memory.quality === memory.quality);
    
    if (similarQualitySales.length > 0) {
      const prices = similarQualitySales.map(sale => sale.price);
      prices.sort((a, b) => a - b);
      const median = prices[Math.floor(prices.length / 2)];
      const expectedBasePrice = basePrice * qualityMultiplier;
      marketAdjustment = median / expectedBasePrice;
    }
    
    // Calculate final estimated value
    const estimatedValue = basePrice * qualityMultiplier * marketAdjustment;
    
    // Provide a range (±15%)
    return {
      low: Math.max(0.01, estimatedValue * 0.85),
      median: estimatedValue,
      high: estimatedValue * 1.15,
      currency: 'SOL',
    };
  }

  /**
   * Find similar memories based on neural patterns
   * @param memory Target memory
   * @param allMemories Pool of memories to search from
   * @param limit Maximum number of results
   * @returns Array of similar memories with similarity score
   */
  static findSimilarMemories(memory: Memory, allMemories: Memory[], limit: number = 5) {
    // This is a simplified implementation
    // In a real implementation, this would use a neural similarity algorithm
    
    const targetType = memory.memoryType?.toLowerCase() || '';
    const targetQuality = memory.quality;
    
    // Filter memories by same type
    const sameTypeMemories = allMemories.filter(m => 
      m.id !== memory.id && 
      m.memoryType?.toLowerCase() === targetType
    );
    
    // Calculate a simple similarity score
    const scored = sameTypeMemories.map(m => {
      const qualityDiff = Math.abs(m.quality - targetQuality);
      // Simple similarity score (higher is better)
      const score = 100 - (qualityDiff * 25);
      
      return {
        memory: m,
        similarityScore: score
      };
    });
    
    // Sort by similarity score (descending)
    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // Return top results
    return scored.slice(0, limit);
  }

  /**
   * Get memory market trends over time
   * @param timeframe Timeframe for trend analysis
   * @returns Market trend data
   */
  static async getMarketTrends(timeframe: 'day' | 'week' | 'month' | 'year' = 'month') {
    try {
      const response = await axios.get(`/api/analytics/market-trends?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market trends:', error);
      return {
        labels: [],
        datasets: [],
        error: 'Failed to fetch market trends'
      };
    }
  }

  /**
   * Get memory value appreciation over time
   * @param memoryId ID of the memory to analyze
   * @returns Value history data
   */
  static async getValueHistory(memoryId: string) {
    try {
      const response = await axios.get(`/api/analytics/value-history/${memoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching value history:', error);
      return {
        labels: [],
        values: [],
        error: 'Failed to fetch value history'
      };
    }
  }

  /**
   * Get validator performance metrics
   * @param validatorId ID of the validator to analyze
   * @returns Validator performance data
   */
  static async getValidatorPerformance(validatorId: string) {
    try {
      const response = await axios.get(`/api/analytics/validator/${validatorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching validator performance:', error);
      return {
        consensus: 0,
        accuracy: 0,
        responseTime: 0,
        validationCount: 0,
        error: 'Failed to fetch validator performance'
      };
    }
  }
}

export default AnalyticsService; 