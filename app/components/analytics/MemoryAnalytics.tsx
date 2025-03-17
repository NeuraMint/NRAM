import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Memory } from '../../types/memory';
import AnalyticsService from '../../services/analyticsService';

interface MemoryAnalyticsProps {
  memories: Memory[];
  recentSales?: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const MemoryAnalytics: React.FC<MemoryAnalyticsProps> = ({ memories, recentSales = [] }) => {
  const [marketTrends, setMarketTrends] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get distribution data
  const qualityDistribution = AnalyticsService.getQualityDistribution(memories);
  const typeDistribution = AnalyticsService.getTypeDistribution(memories);

  // Fetch market trends
  useEffect(() => {
    const fetchMarketTrends = async () => {
      setIsLoading(true);
      const data = await AnalyticsService.getMarketTrends(timeframe);
      setMarketTrends(data);
      setIsLoading(false);
    };

    fetchMarketTrends();
  }, [timeframe]);

  const renderQualityDistribution = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Memory Quality Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={qualityDistribution.labels.map((label, index) => ({
                name: label,
                value: qualityDistribution.data[index]
              }))}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {qualityDistribution.labels.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} Memories`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {qualityDistribution.labels.map((label, index) => (
          <div key={label} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <div className="text-sm">
              <p className="font-medium">{label}</p>
              <p className="text-gray-500">
                {qualityDistribution.data[index]} memories ({qualityDistribution.percentages[label.toLowerCase().replace(' ', '')] ? qualityDistribution.percentages[label.toLowerCase().replace(' ', '')].toFixed(1) : 0}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTypeDistribution = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Memory Type Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={typeDistribution.labels.map((label, index) => ({
              name: label,
              count: typeDistribution.data[index]
            }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} Memories`, 'Count']} />
            <Bar dataKey="count" fill="#8884d8">
              {typeDistribution.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderMarketTrends = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Market Price Trends</h3>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setTimeframe('day')}
          className={`px-3 py-1 rounded ${timeframe === 'day' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Day
        </button>
        <button
          onClick={() => setTimeframe('week')}
          className={`px-3 py-1 rounded ${timeframe === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeframe('month')}
          className={`px-3 py-1 rounded ${timeframe === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Month
        </button>
        <button
          onClick={() => setTimeframe('year')}
          className={`px-3 py-1 rounded ${timeframe === 'year' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Year
        </button>
      </div>
      <div className="h-64">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : marketTrends && marketTrends.labels && marketTrends.labels.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={marketTrends.labels.map((label, index) => ({
                name: label,
                common: marketTrends.datasets[0].data[index],
                fine: marketTrends.datasets[1].data[index],
                excellent: marketTrends.datasets[2].data[index],
                legendary: marketTrends.datasets[3].data[index],
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} SOL`, '']} />
              <Legend />
              <Line type="monotone" dataKey="common" stroke={COLORS[0]} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="fine" stroke={COLORS[1]} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="excellent" stroke={COLORS[2]} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="legendary" stroke={COLORS[3]} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No market trend data available
          </div>
        )}
      </div>
    </div>
  );

  const renderValueAnalysis = () => {
    // Calculate total collection value
    const totalValue = memories.reduce((sum, memory) => {
      const estimate = AnalyticsService.getEstimatedValue(memory, recentSales);
      return sum + estimate.median;
    }, 0);

    // Find highest value memory
    let highestValueMemory = null;
    let highestValue = 0;

    memories.forEach(memory => {
      const estimate = AnalyticsService.getEstimatedValue(memory, recentSales);
      if (estimate.median > highestValue) {
        highestValue = estimate.median;
        highestValueMemory = memory;
      }
    });

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Value Analysis</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-2">Collection Overview</h4>
            <p className="text-3xl font-bold text-indigo-600">{totalValue.toFixed(2)} SOL</p>
            <p className="text-sm text-gray-500">Estimated Total Value</p>
            
            <div className="mt-4">
              <p className="font-medium">Memory Count: {memories.length}</p>
              <p className="text-sm text-gray-500">Avg. Value: {memories.length > 0 ? (totalValue / memories.length).toFixed(2) : 0} SOL</p>
            </div>
          </div>
          
          {highestValueMemory && (
            <div className="border rounded-lg p-4">
              <h4 className="text-lg font-semibold mb-2">Highest Value Memory</h4>
              <p className="text-xl font-medium">{highestValueMemory.name}</p>
              <p className="text-3xl font-bold text-indigo-600">{highestValue.toFixed(2)} SOL</p>
              <p className="text-sm">
                Quality: {["Common", "Fine", "Excellent", "Legendary"][highestValueMemory.quality - 1]}
              </p>
              <p className="text-sm">
                Type: {highestValueMemory.memoryType}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderQualityDistribution()}
        {renderTypeDistribution()}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderMarketTrends()}
        {renderValueAnalysis()}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Neural Pattern Analysis</h3>
        <p className="text-gray-500">
          Advanced neural pattern analysis provides insights into the unique characteristics of your memories.
          This feature analyzes the neural fingerprints to identify patterns, similarities, and clusters
          in your memory collection.
        </p>
        
        <div className="mt-4 flex justify-center">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
            Generate Advanced Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryAnalytics; 