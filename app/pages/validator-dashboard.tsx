import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { Toaster, toast } from 'react-hot-toast';
import { ValidationService, ValidatorStats, ValidationError, ValidationErrorType } from '../services/validationService';
import config from '../config/environment';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';

// Validation history interface
interface ValidationHistory {
  memoryId: string;
  memoryName: string;
  timestamp: Date;
  score: number;
  isValid: boolean;
  processed: boolean;
  rewarded: boolean;
  rewardAmount: number;
}

// Validator ranking interface
interface ValidatorRanking {
  rank: number;
  publicKey: string;
  completedValidations: number;
  successRate: number;
  reputation: number;
}

// Chart data interfaces
interface DailyStats {
  day: string;
  validations: number;
  rewards: number;
}

interface ValidationBreakdown {
  name: string;
  value: number;
  color: string;
}

const ValidatorDashboard: React.FC = () => {
  const router = useRouter();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;

  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [validatorStats, setValidatorStats] = useState<ValidatorStats | null>(null);
  const [validationHistory, setValidationHistory] = useState<ValidationHistory[]>([]);
  const [rankings, setRankings] = useState<ValidatorRanking[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'rankings'>('stats');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  const [claimingRewards, setClaimingRewards] = useState<boolean>(false);
  
  // Chart data states
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [validationBreakdown, setValidationBreakdown] = useState<ValidationBreakdown[]>([]);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Initialize validation service
  const validationService = new ValidationService();

  // Load validator data
  const loadValidatorData = useCallback(async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    try {
      // Check if user is a validator
      const isUserValidator = await validationService.isValidator(publicKey);
      
      if (isUserValidator) {
        // Get validator statistics
        const stats = await validationService.getValidatorStats(publicKey);
        setValidatorStats(stats);
        
        // Generate chart data
        generateChartData(stats);
      } else {
        // If not a validator, redirect to validator registration page
        toast.error('[Chinese UI text] 您还不是Validate者');
        router.push('/validator-registration');
        return;
      }
    } catch (error) {
      console.error('Error loading validator data:', error);
      
      if (error instanceof ValidationError) {
        switch(error.type) {
          case ValidationErrorType.CONNECTION_FAILED:
            toast.error('Network connection error, please check your internet connection');
            break;
          case ValidationErrorType.INVALID_ADDRESS:
            toast.error('Invalid wallet address');
            break;
          default:
            toast.error(`Error loading validator data: ${error.message}`);
        }
      } else {
        toast.error('[Chinese UI text] 加载Validate者数据失败');
      }
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, router]);

  // Generate chart data based on validator stats
  const generateChartData = (stats: ValidatorStats) => {
    // Generate daily stats data for the line chart
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const mockDailyStats: DailyStats[] = days.map((day, index) => {
      // In production, this would be filled with real data
      return {
        day,
        validations: Math.floor(Math.random() * 10) + 1,
        rewards: parseFloat((Math.random() * 0.5).toFixed(2))
      };
    });
    setDailyStats(mockDailyStats);
    
    // Generate validation breakdown data for the pie chart
    setValidationBreakdown([
      { name: '有效', value: Math.round(stats.completedValidations * stats.successRate / 100), color: '#10B981' },
      { name: '无效', value: Math.round(stats.completedValidations * (100 - stats.successRate) / 100), color: '#EF4444' }
    ]);
  };

  // Load validation history
  const loadValidationHistory = useCallback(async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    try {
      // Simulating fetching validation history data
      // In a real project, this would call the blockchain or API
      const mockHistory: ValidationHistory[] = [
        {
          memoryId: 'memory123',
          memoryName: '巴黎旅行记忆',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          score: 85,
          isValid: true,
          processed: true,
          rewarded: true,
          rewardAmount: 0.05,
        },
        {
          memoryId: 'memory456',
          memoryName: '毕业典礼',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          score: 92,
          isValid: true,
          processed: true,
          rewarded: true,
          rewardAmount: 0.07,
        },
        {
          memoryId: 'memory789',
          memoryName: '第一次骑自行车',
          timestamp: new Date(Date.now() - 259200000), // 3 days ago
          score: 30,
          isValid: false,
          processed: true,
          rewarded: false,
          rewardAmount: 0,
        },
        {
          memoryId: 'memory101',
          memoryName: '海边度假',
          timestamp: new Date(Date.now() - 345600000), // 4 days ago
          score: 78,
          isValid: true,
          processed: true,
          rewarded: true,
          rewardAmount: 0.04,
        },
        {
          memoryId: 'memory102',
          memoryName: '第一次工作面试',
          timestamp: new Date(Date.now() - 432000000), // 5 days ago
          score: 88,
          isValid: true,
          processed: true,
          rewarded: true,
          rewardAmount: 0.06,
        },
        {
          memoryId: 'memory103',
          memoryName: '家庭聚会',
          timestamp: new Date(Date.now() - 518400000), // 6 days ago
          score: 95,
          isValid: true,
          processed: true,
          rewarded: true,
          rewardAmount: 0.08,
        },
        {
          memoryId: 'memory104',
          memoryName: '生日派对',
          timestamp: new Date(Date.now() - 604800000), // 7 days ago
          score: 90,
          isValid: true,
          processed: true,
          rewarded: true,
          rewardAmount: 0.07,
        },
        {
          memoryId: 'memory105',
          memoryName: '第一次演讲',
          timestamp: new Date(Date.now() - 691200000), // 8 days ago
          score: 65,
          isValid: true,
          processed: true,
          rewarded: true,
          rewardAmount: 0.03,
        }
      ];

      // Filter data based on selected time range
      let filteredHistory: ValidationHistory[] = [];
      const now = new Date();
      
      switch (timeRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredHistory = mockHistory.filter(item => item.timestamp >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredHistory = mockHistory.filter(item => item.timestamp >= monthAgo);
          break;
        case 'all':
        default:
          filteredHistory = [...mockHistory];
          break;
      }

      setValidationHistory(filteredHistory);
    } catch (error) {
      console.error('Error loading validation history:', error);
      toast.error('[Chinese UI text] 无法加载Validate历史');
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, timeRange]);

  // Load validator rankings
  const loadValidatorRankings = useCallback(async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    try {
      // Simulating fetching validator ranking data
      // In a real project, this would call the blockchain or API
      const mockRankings: ValidatorRanking[] = [
        {
          rank: 1,
          publicKey: 'Gs1MnB5PArhDFxJTZxmVnhqEFsZYUiJYQCdW7JVWjmC6',
          completedValidations: 512,
          successRate: 98.4,
          reputation: 96,
        },
        {
          rank: 2,
          publicKey: 'X5oerZy5WYD9pFfP4rN6XhJ84BQJz6zZ7UXm79QN3qJ',
          completedValidations: 478,
          successRate: 97.9,
          reputation: 94,
        },
        {
          publicKey: publicKey.toString(),
          rank: 3,
          completedValidations: 423,
          successRate: 95.2,
          reputation: 89,
        },
        {
          rank: 4,
          publicKey: 'HwmcuNiV65QwS5JcJFbLJPZMuxwNuQnWPgkqnJPvYRGk',
          completedValidations: 412,
          successRate: 94.8,
          reputation: 87,
        },
        {
          rank: 5,
          publicKey: '7U9eUz5NUDNRcT1nuLAJouGRCwoYaVkwWQMg2yYXLu5d',
          completedValidations: 387,
          successRate: 93.5,
          reputation: 85,
        }
      ];

      setRankings(mockRankings);
    } catch (error) {
      console.error('Error loading validator rankings:', error);
      toast.error('[Chinese UI text] 无法加载Validate者排名');
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

  // Handle claiming rewards
  const handleClaimRewards = async () => {
    if (!connected || !publicKey || !validatorStats || validatorStats.pendingRewards <= 0) return;
    
    try {
      setClaimingRewards(true);
      
      // Show loading toast
      toast.loading('Claiming rewards...', { id: 'claim-rewards' });
      
      // Call validation service to claim rewards
      const signature = await validationService.claimRewards(publicKey);
      
      // Show success toast
      toast.success('Rewards claimed successfully!', { 
        id: 'claim-rewards',
        duration: 5000,
        icon: '💰'
      });
      
      console.log('Reward claim transaction signature:', signature);
      
      // Reload validator data
      await loadValidatorData();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      
      // Show error toast
      if (error instanceof ValidationError) {
        switch(error.type) {
          case ValidationErrorType.CONNECTION_FAILED:
            toast.error('Network connection error, please try again later', { id: 'claim-rewards' });
            break;
          case ValidationErrorType.REWARD_CLAIM_FAILED:
            toast.error('[Chinese UI text] Failed to claim rewards，请稍后再试', { id: 'claim-rewards' });
            break;
          default:
            toast.error(`Error claiming rewards: ${error.message}`, { id: 'claim-rewards' });
        }
      } else {
        toast.error('Failed to claim rewards, please try again', { id: 'claim-rewards' });
      }
    } finally {
      setClaimingRewards(false);
    }
  };

  // Load data when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      loadValidatorData();
    }
  }, [connected, publicKey, loadValidatorData]);

  // Load appropriate data when tab changes
  useEffect(() => {
    if (!connected || !publicKey) return;
    
    switch (activeTab) {
      case 'history':
        loadValidationHistory();
        break;
      case 'rankings':
        loadValidatorRankings();
        break;
      default:
        break;
    }
  }, [activeTab, connected, publicKey, loadValidationHistory, loadValidatorRankings]);

  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format reward amount
  const formatReward = (amount: number): string => {
    return `${amount.toFixed(4)} NRAM`;
  };

  // Render stats view with enhanced visualization
  const renderStatsView = () => {
    if (!validatorStats) return null;
    
    return (
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 text-sm mb-1">[Chinese UI text] 总Validate数</h3>
            <p className="text-2xl font-bold">{validatorStats.completedValidations}</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 text-sm mb-1">[Chinese UI text] 成功率</h3>
            <p className="text-2xl font-bold text-green-400">{validatorStats.successRate.toFixed(1)}%</p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 text-sm mb-1">[Chinese UI text] 总Rewards</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {(validatorStats.totalRewards / 1000000000).toFixed(4)} NRAM
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-gray-400 text-sm mb-1">[Chinese UI text] 待领取Rewards</h3>
            <div className="flex justify-between items-center">
              <p className="text-2xl font-bold text-green-400">
                {(validatorStats.pendingRewards / 1000000000).toFixed(4)} NRAM
              </p>
              <button
                onClick={handleClaimRewards}
                disabled={validatorStats.pendingRewards <= 0 || claimingRewards}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded-md transition-colors"
              >
                {claimingRewards ? '处理中...' : '领取'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Additional stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-4 md:col-span-2">
            <h3 className="text-lg font-bold mb-4">[Chinese UI text] 每日Validate活动</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyStats}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#F9FAFB' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="validations" 
                    name="Validate数量" 
                    stroke="#8B5CF6" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rewards" 
                    name="Rewards (NRAM)" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-lg font-bold mb-4">[Chinese UI text] Validate结果分布</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={validationBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {validationBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Validator profile */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">[Chinese UI text] Validate者资料</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">[Chinese UI text] 钱包地址</span>
              <span className="font-mono">{formatAddress(validatorStats.publicKey.toString())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">[Chinese UI text] 质押金额</span>
              <span>{(validatorStats.stakedAmount / 1000000000).toFixed(2)} NRAM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">[Chinese UI text] Validate者状态</span>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${validatorStats.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span>{validatorStats.isActive ? '活跃' : '非活跃'}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">[Chinese UI text] 声誉分数</span>
              <div className="flex items-center">
                <div className="w-32 h-2 bg-gray-700 rounded-full mr-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full" 
                    style={{ width: `${validatorStats.reputation}%` }}
                  ></div>
                </div>
                <span className="font-bold">{validatorStats.reputation}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">[Chinese UI text] 本周Rewards</span>
              <span className="text-yellow-400">{(validatorStats.weeklyRewards / 1000000000).toFixed(4)} NRAM</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render history view
  const renderHistoryView = () => {
    if (validationHistory.length === 0) {
      return (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">[Chinese UI text] 暂无Validate历史</h3>
          <p className="text-gray-400 mb-4">[Chinese UI text] 
            您还没有进行过任何Validate，或选择的时间范围内没有Validate记录。
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Time range selector */}
        <div className="bg-gray-800 rounded-xl p-4 flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('week')}
          >[Chinese UI text] 
            本周
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('month')}
          >[Chinese UI text] 
            本月
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setTimeRange('all')}
          >[Chinese UI text] 
            全部
          </button>
        </div>
        
        {/* Activity chart */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-lg font-bold mb-4">[Chinese UI text] Validate活动图表</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={validationHistory.map(item => ({
                  date: formatDate(item.timestamp).split(' ')[0],
                  score: item.score,
                  reward: item.rewardAmount * 100 // Scale up for visibility
                }))}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                  formatter={(value, name) => {
                    if (name === 'reward') return [`${(Number(value) / 100).toFixed(2)} NRAM`, 'Rewards'];
                    return [value, name === 'score' ? '分数' : name];
                  }}
                />
                <Legend />
                <Bar dataKey="score" name="Validate分数" fill="#8B5CF6" />
                <Bar dataKey="reward" name="Rewards" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* History list */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="text-left p-4">Memory name</th>
                  <th className="text-left p-4">[Chinese UI text] Validate时间</th>
                  <th className="text-left p-4">[Chinese UI text] Validate分数</th>
                  <th className="text-left p-4">[Chinese UI text] 结果</th>
                  <th className="text-left p-4">Rewards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {validationHistory.map((item, index) => (
                  <tr key={item.memoryId} className="hover:bg-gray-750">
                    <td className="p-4">{item.memoryName}</td>
                    <td className="p-4">{formatDate(item.timestamp)}</td>
                    <td className="p-4">{item.score}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isValid ? '有效' : '无效'}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.rewarded ? (
                        <span className="text-green-400">{formatReward(item.rewardAmount)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render rankings view
  const renderRankingsView = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-left p-4">[Chinese UI text] 排名</th>
                <th className="text-left p-4">[Chinese UI text] Validate者</th>
                <th className="text-left p-4">[Chinese UI text] Validate数量</th>
                <th className="text-left p-4">[Chinese UI text] 成功率</th>
                <th className="text-left p-4">[Chinese UI text] 声誉分数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {rankings.map((ranking) => (
                <tr 
                  key={ranking.publicKey} 
                  className={`hover:bg-gray-750 ${
                    ranking.publicKey === publicKey?.toString() ? 'bg-purple-900/20' : ''
                  }`}
                >
                  <td className="p-4">
                    {ranking.rank <= 3 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 font-bold">
                        {ranking.rank}
                      </span>
                    ) : (
                      <span>{ranking.rank}</span>
                    )}
                  </td>
                  <td className="p-4 font-mono">
                    {formatAddress(ranking.publicKey)}
                    {ranking.publicKey === publicKey?.toString() && (
                      <span className="ml-2 text-xs bg-purple-600 px-2 py-0.5 rounded-full">[Chinese UI text] 您</span>
                    )}
                  </td>
                  <td className="p-4">{ranking.completedValidations}</td>
                  <td className="p-4 text-green-400">{ranking.successRate}%</td>
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-700 rounded-full mr-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full" 
                          style={{ width: `${ranking.reputation}%` }}
                        ></div>
                      </div>
                      <span>{ranking.reputation}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reputation Ranking Chart */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-lg font-bold mb-4">[Chinese UI text] 声誉排名对比</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rankings.map(r => ({
                  name: r.publicKey === publicKey?.toString() ? '您' : formatAddress(r.publicKey),
                  reputation: r.reputation,
                  validations: r.completedValidations,
                  isCurrentUser: r.publicKey === publicKey?.toString()
                }))}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem' }}
                />
                <Legend />
                <Bar dataKey="reputation" name="声誉分数" radius={[4, 4, 0, 0]}>
                  {rankings.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.publicKey === publicKey?.toString() ? '#8B5CF6' : '#10B981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>[Chinese UI text] Validate者仪表盘 | NeuraMint</title>
        <meta name="description" content="查看您的Validate者统计数据、历史记录和排名" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <main className="container mx-auto px-4 py-6 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">[Chinese UI text] Validate者仪表盘</h1>
        <p className="text-gray-300 mb-6 md:mb-8">[Chinese UI text] 查看您的Validate统计数据、历史记录和排名</p>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        ) : !connected ? (
          <div className="bg-gray-800 rounded-xl p-6 md:p-10 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4">[Chinese UI text] 请连接您的钱包</h2>
            <p className="text-gray-400 mb-6">[Chinese UI text] 
              连接钱包以访问您的Validate者仪表盘，查看统计数据，历史记录和排名。
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* Tab selector */}
            <div className="bg-gray-800 rounded-xl p-1 flex space-x-1 max-w-md overflow-x-auto scrollbar-hide">
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-center transition-colors ${
                  activeTab === 'stats' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('stats')}
              >[Chinese UI text] 
                统计数据
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-center transition-colors ${
                  activeTab === 'history' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('history')}
              >[Chinese UI text] 
                Validate历史
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-center transition-colors ${
                  activeTab === 'rankings' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('rankings')}
              >[Chinese UI text] 
                排行榜
              </button>
            </div>
            
            {/* Content area */}
            <div>
              {activeTab === 'stats' && renderStatsView()}
              {activeTab === 'history' && renderHistoryView()}
              {activeTab === 'rankings' && renderRankingsView()}
            </div>
            
            {/* Quick action button for mobile */}
            <div className="fixed bottom-8 right-8">
              <button
                onClick={() => router.push('/validate')}
                className="bg-purple-600 hover:bg-purple-700 rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
                title="开始Validate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Toaster position="bottom-center" />
    </div>
  );
};

export default ValidatorDashboard; 