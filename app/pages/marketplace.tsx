import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import MemoryCard from '../components/MemoryCard';
import { useMintService, useWalletStatus } from '../utils/walletUtils';
import { BrainRegion } from '../utils/neuralUtils';

// Sample marketplace memory interface
interface MarketplaceMemory {
  id: string;
  name: string;
  owner: string;
  imageUrl: string;
  memoryType: 'cognitive' | 'emotional' | 'cultural' | 'therapeutic';
  quality: 'common' | 'fine' | 'excellent' | 'legendary';
  neuralFingerprint: string;
  timestamp: number;
  price: number;
  brainRegion: BrainRegion;
}

// Sort types
type SortType = 'price-asc' | 'price-desc' | 'date-asc' | 'date-desc' | 'quality';

// Filter interface
interface FilterOptions {
  types: string[];
  qualities: string[];
  minPrice: number;
  maxPrice: number;
  brainRegions: string[];
}

// Sample data
const mockMemories: MarketplaceMemory[] = [
  {
    id: '1',
    name: 'Cognitive Insight',
    owner: '8dHEoTdFUqnqnFz4SsC7yYf8WnwEMKcAHKQhbGVXKjGS',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    memoryType: 'cognitive',
    quality: 'excellent',
    neuralFingerprint: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    timestamp: Date.now() - 86400000 * 2,
    price: 580,
    brainRegion: BrainRegion.PREFRONTAL_CORTEX
  },
  {
    id: '2',
    name: 'Emotional Connection',
    owner: '6Jgh4DvPhmNgqTo3K5cZLqoXbKZYjheFJKsHfyXNNF5Q',
    imageUrl: 'https://images.unsplash.com/photo-1610034458992-edbb9939e1f1',
    memoryType: 'emotional',
    quality: 'legendary',
    neuralFingerprint: '0x5a75ab2aa8e85cbd4b0c11c69ee093eeea74c4c1e11afc27b767aca1b8b9f471',
    timestamp: Date.now() - 86400000 * 5,
    price: 2500,
    brainRegion: BrainRegion.AMYGDALA
  },
  {
    id: '3',
    name: 'Cultural Heritage',
    owner: '4vJ9JU1bJJE96FbKEzL9Gzb8XvKe6hGXbdmTqkjuSoZ7',
    imageUrl: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c',
    memoryType: 'cultural',
    quality: 'fine',
    neuralFingerprint: '0x3a78828ab199aa882f275767b7d9bad7985a8a8cae92a9f13e4aad34bdb32466',
    timestamp: Date.now() - 86400000 * 10,
    price: 320,
    brainRegion: BrainRegion.TEMPORAL_LOBE
  },
  {
    id: '4',
    name: 'Therapeutic Calm',
    owner: '2cZvG4Ecwjq5RZ9f9Fkgn1jGWfhHUNMPDxPzTBcHXz3D',
    imageUrl: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e',
    memoryType: 'therapeutic',
    quality: 'common',
    neuralFingerprint: '0xe34f21c5b3017e5a9e4ab494e5c3f7ddb6c5ab9b0cd20c4fa8f8a29c1441ca71',
    timestamp: Date.now() - 86400000 * 15,
    price: 150,
    brainRegion: BrainRegion.LIMBIC_SYSTEM
  },
  {
    id: '5',
    name: 'Visual Experience',
    owner: '8dHEoTdFUqnqnFz4SsC7yYf8WnwEMKcAHKQhbGVXKjGS',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4',
    memoryType: 'cognitive',
    quality: 'excellent',
    neuralFingerprint: '0x9d4e1e23d3c8249c7ddbc0fe6717f272e7f151933950cd4c902b64688c5c8395',
    timestamp: Date.now() - 86400000 * 8,
    price: 780,
    brainRegion: BrainRegion.VISUAL_CORTEX
  },
  {
    id: '6',
    name: 'Auditory Memory',
    owner: '6Jgh4DvPhmNgqTo3K5cZLqoXbKZYjheFJKsHfyXNNF5Q',
    imageUrl: 'https://images.unsplash.com/photo-1558862107-d49ef2a04d72',
    memoryType: 'emotional',
    quality: 'fine',
    neuralFingerprint: '0x6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918',
    timestamp: Date.now() - 86400000 * 3,
    price: 290,
    brainRegion: BrainRegion.AUDITORY_CORTEX
  }
];

/**
 * Memory marketplace page
 */
const Marketplace: React.FC = () => {
  const { connection } = useConnection();
  const { isConnected, publicKey } = useWalletStatus();
  const mintService = useMintService();
  
  // State management
  const [memories, setMemories] = useState<MarketplaceMemory[]>(mockMemories);
  const [filteredMemories, setFilteredMemories] = useState<MarketplaceMemory[]>(mockMemories);
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [isLoading, setIsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    types: [],
    qualities: [],
    minPrice: 0,
    maxPrice: 10000,
    brainRegions: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get memory NFTs from the blockchain marketplace
  // Note: This is a mock implementation, actual application needs to interact with the marketplace contract
  useEffect(() => {
    const fetchMarketItems = async () => {
      try {
        setIsLoading(true);
        
        // In an actual application, this would call the marketplace contract to get listed NFTs
        // Currently using mock data
        setTimeout(() => {
          setMemories(mockMemories);
          setFilteredMemories(mockMemories);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching marketplace items:', error);
        setIsLoading(false);
      }
    };
    
    fetchMarketItems();
  }, [connection]);
  
  // [Chinese comment] 应用排序
  useEffect(() => {
    const sortedMemories = [...filteredMemories];
    
    switch (sortType) {
      case 'price-asc':
        sortedMemories.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sortedMemories.sort((a, b) => b.price - a.price);
        break;
      case 'date-asc':
        sortedMemories.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'date-desc':
        sortedMemories.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'quality':
        const qualityRank = { common: 0, fine: 1, excellent: 2, legendary: 3 };
        sortedMemories.sort((a, b) => qualityRank[b.quality] - qualityRank[a.quality]);
        break;
    }
    
    setFilteredMemories(sortedMemories);
  }, [sortType, memories]);
  
  // [Chinese comment] 应用筛选
  useEffect(() => {
    let result = [...memories];
    
    // [Chinese comment] 应用搜索查询
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        memory => memory.name.toLowerCase().includes(query) || 
                 memory.neuralFingerprint.toLowerCase().includes(query)
      );
    }
    
    // [Chinese comment] 应用类型筛选
    if (filterOptions.types.length > 0) {
      result = result.filter(memory => filterOptions.types.includes(memory.memoryType));
    }
    
    // [Chinese comment] 应用质量筛选
    if (filterOptions.qualities.length > 0) {
      result = result.filter(memory => filterOptions.qualities.includes(memory.quality));
    }
    
    // [Chinese comment] 应用价格筛选
    result = result.filter(
      memory => memory.price >= filterOptions.minPrice && memory.price <= filterOptions.maxPrice
    );
    
    // [Chinese comment] 应用脑区筛选
    if (filterOptions.brainRegions.length > 0) {
      result = result.filter(memory =>[Chinese UI text]  filterOptions.brainRegions.includes(memory.brainRegion));
    }
    
    setFilteredMemories(result);
  }, [memories, filterOptions, searchQuery]);
  
  // [Chinese comment] 搜索更改处理程序
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>[Chinese UI text]  {
    setSearchQuery(e.target.value);
  };
  
  // [Chinese comment] 排序更改处理程序
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortType(e.target.value as SortType);
  };
  
  // [Chinese comment] 添加/删除类型过滤器
  const toggleTypeFilter = (type: string) => {
    setFilterOptions(prev => {
      const types = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      
      return { ...prev, types };
    });
  };
  
  // [Chinese comment] 添加/删除质量过滤器
  const toggleQualityFilter = (quality: string) => {
    setFilterOptions(prev => {
      const qualities = prev.qualities.includes(quality)
        ? prev.qualities.filter(q => q !== quality)
        : [...prev.qualities, quality];
      
      return { ...prev, qualities };
    });
  };
  
  // [Chinese comment] 添加/删除脑区过滤器
  const toggleBrainRegionFilter = (region: string) => {
    setFilterOptions(prev => {
      const brainRegions = prev.brainRegions.includes(region)
        ? prev.brainRegions.filter(r => r !== region)
        : [...prev.brainRegions, region];
      
      return { ...prev, brainRegions };
    });
  };
  
  // [Chinese comment] 更新价格范围
  const handlePriceChange = (min: number, max: number) => {
    setFilterOptions(prev => ({ ...prev, minPrice: min, maxPrice: max }));
  };
  
  // [Chinese comment] 重置所有过滤器
  const resetFilters = () => {
    setFilterOptions({
      types: [],
      qualities: [],
      minPrice: 0,
      maxPrice: 10000,
      brainRegions: []
    });
    setSearchQuery('');
  };
  
  return (
    <>
      <Head>
        <title>[Chinese UI text] NeuraMint - 记忆Marketplace</title>
        <meta name="description" content="浏览并交易记忆NFT" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">[Chinese UI text] 记忆Marketplace</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 筛选侧边栏 */}
          <div className="lg:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">[Chinese UI text] 筛选</h2>
            
            {/* 搜索框 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">[Chinese UI text] 搜索</label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="搜索Memory name或神经指纹..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* 记忆类型筛选 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">[Chinese UI text] 记忆类型</h3>
              <div className="space-y-2">
                {['cognitive', 'emotional', 'cultural', 'therapeutic'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterOptions.types.includes(type)}
                      onChange={() => toggleTypeFilter(type)}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-gray-700 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* 记忆质量筛选 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">[Chinese UI text] 记忆质量</h3>
              <div className="space-y-2">
                {['common', 'fine', 'excellent', 'legendary'].map(quality => (
                  <label key={quality} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterOptions.qualities.includes(quality)}
                      onChange={() => toggleQualityFilter(quality)}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-gray-700 capitalize">{quality}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* 价格范围筛选 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">[Chinese UI text] 价格范围 (NRAM)</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={0}
                  value={filterOptions.minPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value), filterOptions.maxPrice)}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span>[Chinese UI text] 到</span>
                <input
                  type="number"
                  min={filterOptions.minPrice}
                  value={filterOptions.maxPrice}
                  onChange={(e) => handlePriceChange(filterOptions.minPrice, Number(e.target.value))}
                  className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            {/* 脑区筛选 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">[Chinese UI text] 脑区</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.values(BrainRegion).map(region => (
                  <label key={region} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filterOptions.brainRegions.includes(region)}
                      onChange={() => toggleBrainRegionFilter(region)}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-gray-700">{region}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* 重置筛选器按钮 */}
            <button 
              onClick={resetFilters}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
            >[Chinese UI text] 
              重置筛选器
            </button>
          </div>
          
          {/* 主内容区 */}
          <div className="lg:w-3/4">
            {/* 排序和结果摘要 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4 md:mb-0">[Chinese UI text] 
                找到 <span className="font-semibold">{filteredMemories.length}</span>[Chinese UI text]  个记忆
              </p>
              
              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm text-gray-700 mr-2">[Chinese UI text] 排序:</label>
                <select
                  id="sort"
                  value={sortType}
                  onChange={handleSortChange}
                  className="bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="date-desc">[Chinese UI text] 最新</option>
                  <option value="date-asc">[Chinese UI text] 最早</option>
                  <option value="price-asc">[Chinese UI text] Price: Low to High</option>
                  <option value="price-desc">[Chinese UI text] Price: High to Low</option>
                  <option value="quality">[Chinese UI text] 质量</option>
                </select>
              </div>
            </div>[Chinese UI text] 
            
            {/* 记忆网格 */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredMemories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMemories.map(memory => (
                  <div key={memory.id} className="relative">
                    <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {memory.price} NRAM
                    </div>
                    <MemoryCard
                      id={memory.id}
                      name={memory.name}
                      owner={memory.owner}
                      imageUrl={memory.imageUrl}
                      memoryType={memory.memoryType}
                      quality={memory.quality}
                      timestamp={memory.timestamp}
                      neuralFingerprint={memory.neuralFingerprint}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">[Chinese UI text] 未找到记忆</h3>
                <p className="text-gray-500">[Chinese UI text] 尝试调整您的筛选条件或搜索查询。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Marketplace; 