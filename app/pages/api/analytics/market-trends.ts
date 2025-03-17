import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Generate mock data for market trends
 * @param timeframe The timeframe for the trend data
 * @returns Mock trend data
 */
const generateMarketTrends = (timeframe: string) => {
  let dataPoints: number;
  let labels: string[] = [];
  
  // Determine number of data points and labels based on timeframe
  switch (timeframe) {
    case 'day':
      dataPoints = 24;
      labels = Array.from({ length: dataPoints }, (_, i) => `${i}:00`);
      break;
    case 'week':
      dataPoints = 7;
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      break;
    case 'month':
      dataPoints = 30;
      labels = Array.from({ length: dataPoints }, (_, i) => `Day ${i + 1}`);
      break;
    case 'year':
      dataPoints = 12;
      labels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      break;
    default:
      dataPoints = 30;
      labels = Array.from({ length: dataPoints }, (_, i) => `Day ${i + 1}`);
  }
  
  // Generate random data for each quality tier
  const generateDataset = (basePrice: number, volatility: number) => {
    let lastPrice = basePrice;
    return Array.from({ length: dataPoints }, () => {
      // Random price change with some trend preservation
      const change = (Math.random() - 0.5) * volatility * basePrice;
      lastPrice = Math.max(0.01, lastPrice + change);
      return parseFloat(lastPrice.toFixed(2));
    });
  };
  
  return {
    labels,
    datasets: [
      {
        label: 'Common',
        data: generateDataset(0.05, 0.1),  // Low base price, low volatility
        borderColor: '#0088FE',
        backgroundColor: 'rgba(0, 136, 254, 0.1)',
      },
      {
        label: 'Fine',
        data: generateDataset(0.2, 0.15),  // Medium base price, medium volatility
        borderColor: '#00C49F',
        backgroundColor: 'rgba(0, 196, 159, 0.1)',
      },
      {
        label: 'Excellent',
        data: generateDataset(0.5, 0.2),   // High base price, high volatility
        borderColor: '#FFBB28',
        backgroundColor: 'rgba(255, 187, 40, 0.1)',
      },
      {
        label: 'Legendary',
        data: generateDataset(1.5, 0.25),  // Very high base price, very high volatility
        borderColor: '#FF8042',
        backgroundColor: 'rgba(255, 128, 66, 0.1)',
      },
    ],
  };
};

/**
 * API handler for memory market trends
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const timeframe = req.query.timeframe as string || 'month';
    const trendData = generateMarketTrends(timeframe);
    
    res.status(200).json(trendData);
  } catch (error) {
    console.error('Error generating market trend data:', error);
    res.status(500).json({ error: 'Failed to generate market trend data' });
  }
} 