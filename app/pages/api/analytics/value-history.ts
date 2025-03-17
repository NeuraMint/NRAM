import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Generate mock value history data for a memory
 * @param memoryId The ID of the memory
 * @returns Mock value history data
 */
const generateValueHistory = (memoryId: string) => {
  // Use memory ID to seed a consistent random value history
  const seed = parseInt(memoryId.replace(/\D/g, '').slice(0, 6) || '123456');
  
  // Generate 60 days of value history
  const days = 60;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Determine base price and growth characteristics based on memory ID
  // This would normally be based on memory quality, type, etc.
  const lastDigit = seed % 10;
  const basePrice = (0.05 + (lastDigit / 100)) * (seed % 100);
  const volatility = 0.02 + ((seed % 20) / 100);
  const trend = (seed % 200) / 1000; // Small upward or downward trend
  
  let currentPrice = basePrice;
  const history = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Random daily change with slight trend
    const changeFactor = (Math.random() - 0.5) * volatility + trend;
    currentPrice = Math.max(0.01, currentPrice * (1 + changeFactor));
    
    history.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(currentPrice.toFixed(3))
    });
  }
  
  return {
    memory_id: memoryId,
    labels: history.map(item => item.date),
    values: history.map(item => item.value),
    currency: 'SOL',
    baseValue: basePrice.toFixed(3),
    currentValue: history[history.length - 1].value.toFixed(3),
    changePercentage: (((history[history.length - 1].value / basePrice) - 1) * 100).toFixed(2)
  };
};

/**
 * API handler for memory value history
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Memory ID is required' });
    }
    
    const historyData = generateValueHistory(id);
    res.status(200).json(historyData);
  } catch (error) {
    console.error('Error generating value history data:', error);
    res.status(500).json({ error: 'Failed to generate value history data' });
  }
} 