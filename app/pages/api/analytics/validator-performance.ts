import { NextApiRequest, NextApiResponse } from 'next';

type ValidatorStats = {
  validatorId: string;
  validatedMemories: number;
  accuracyRate: number;
  averageResponseTime: number;
  reputationScore: number;
  earningsTotal: number;
  earningsHistory: {
    date: string;
    amount: number;
  }[];
  validationDistribution: {
    memoryType: string;
    count: number;
  }[];
  validationTrend: {
    date: string;
    count: number;
  }[];
  stakingHistory: {
    date: string;
    amount: number;
  }[];
};

/**
 * Generate mock validator performance data
 * @param validatorId The ID of the validator
 * @returns Mock validator performance statistics
 */
const generateValidatorStats = (validatorId: string): ValidatorStats => {
  // Use validator ID to seed a consistent random data generation
  const seed = parseInt(validatorId.replace(/\D/g, '').slice(0, 6) || '123456');
  const random = (min: number, max: number) => {
    // Simple pseudo-random number generator using the seed
    const x = Math.sin(seed * 9999 + Math.random()) * 10000;
    return min + (Math.abs(x) % (max - min));
  };
  
  // Basic validator metrics
  const validatedMemories = Math.floor(random(50, 500));
  const accuracyRate = random(85, 99.5);
  const averageResponseTime = random(1.5, 8);
  const reputationScore = random(60, 98);
  const earningsTotal = parseFloat((validatedMemories * random(0.01, 0.05)).toFixed(3));
  
  // Generate 30 days of earnings history
  const days = 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const earningsHistory = [];
  const validationTrend = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Daily earnings (with some variability)
    const dailyEarnings = parseFloat((random(0.001, 0.03) * (1 + (i / days))).toFixed(3));
    earningsHistory.push({
      date: dateStr,
      amount: dailyEarnings
    });
    
    // Daily validations count
    const dailyValidations = Math.floor(random(1, 5) * (1 + (i / days) * 0.5));
    validationTrend.push({
      date: dateStr,
      count: dailyValidations
    });
  }
  
  // Memory type distribution
  const memoryTypes = ['Cognitive', 'Emotional', 'Cultural', 'Therapeutic'];
  const validationDistribution = memoryTypes.map(type => {
    return {
      memoryType: type,
      count: Math.floor(validatedMemories * random(0.1, 0.4))
    };
  });
  
  // Adjust counts to match total
  const totalDistributed = validationDistribution.reduce((sum, item) => sum + item.count, 0);
  const adjustmentFactor = validatedMemories / totalDistributed;
  
  validationDistribution.forEach(item => {
    item.count = Math.floor(item.count * adjustmentFactor);
  });
  
  // Staking history (10 entries)
  const stakingHistory = [];
  const stakingStartDate = new Date();
  stakingStartDate.setDate(stakingStartDate.getDate() - 90);
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(stakingStartDate);
    date.setDate(date.getDate() + (i * 10));
    
    stakingHistory.push({
      date: date.toISOString().split('T')[0],
      amount: parseFloat(random(10, 30).toFixed(1))
    });
  }
  
  return {
    validatorId,
    validatedMemories,
    accuracyRate,
    averageResponseTime,
    reputationScore,
    earningsTotal,
    earningsHistory,
    validationDistribution,
    validationTrend,
    stakingHistory
  };
};

/**
 * API handler for validator performance
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Validator ID is required' });
    }
    
    const stats = generateValidatorStats(id);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error generating validator stats:', error);
    res.status(500).json({ error: 'Failed to generate validator statistics' });
  }
} 