import { useState, useEffect, useCallback } from 'react';
import { ApiService, MemoryNFT } from '../services/apiService';
import { getEnvironmentConfig } from '../utils/environment';

// [Chinese comment] 内存类型定义
export type MemoryType = 'visual' | 'conceptual' | 'emotional' | 'procedural' | 'episodic' | 'spatial';
export type MemoryQuality = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type SortOption = 'price_asc' | 'price_desc' | 'quality_asc' | 'quality_desc' | 'newest' | 'oldest';

// [Chinese comment] 映射函数：将字符串类型转换为MemoryType类型
const mapStringToMemoryType = (type: string): MemoryType => {
  if (
    type === 'visual' ||
    type === 'conceptual' ||
    type === 'emotional' ||
    type === 'procedural' ||
    type === 'episodic' ||
    type === 'spatial'
  ) {
    return type as MemoryType;
  }
  return 'conceptual'; // [Chinese comment] 默认类型
};

// [Chinese comment] 映射函数：将字符串品质转换为MemoryQuality类型
const mapStringToMemoryQuality = (quality: string): MemoryQuality => {
  const qualityMap: Record<string, MemoryQuality> = {
    'common': 'common',
    'uncommon': 'uncommon',
    'rare': 'rare',
    'epic': 'epic',
    'legendary': 'legendary',
    // [Chinese comment] 添加其他可能的映射
    'low': 'common',
    'medium': 'rare',
    'high': 'epic'
  };
  
  return qualityMap[quality.toLowerCase()] || 'common';
};

// [Chinese comment] 内存数据接口
export interface Memory {
  id: string;
  name: string;
  description: string;
  memoryType: MemoryType;
  quality: MemoryQuality;
  imageUrl: string;
  neuralFingerprint: string;
  price: number | null;
  owner: string;
  mintAddress: string;
  createdAt: string;
  isTransferable: boolean;
}

// [Chinese comment] 过滤选项接口
export interface FilterOptions {
  types: MemoryType[];
  qualities: MemoryQuality[];
  minPrice: number | null;
  maxPrice: number | null;
  searchTerm: string;
}

// [Chinese comment] 将API返回的MemoryNFT转换为UI使用的Memory
const convertMemoryNFTToMemory = (memoryNFT: MemoryNFT): Memory =>[Chinese UI text]  {
  return {
    id: memoryNFT.id,
    name: memoryNFT.name,
    description: memoryNFT.description,
    memoryType: mapStringToMemoryType(memoryNFT.type),
    quality: mapStringToMemoryQuality(memoryNFT.quality),
    imageUrl: memoryNFT.imageUrl,
    neuralFingerprint: memoryNFT.neuralFingerprint,
    price: memoryNFT.price || null,
    owner: memoryNFT.owner,
    mintAddress: memoryNFT.mintAddress,
    createdAt: memoryNFT.createdAt,
    isTransferable: memoryNFT.isTransferable
  };
};

// [Chinese comment] 内存MarketplaceHook
export function useMemoryMarket() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    types: [],
    qualities: [],
    minPrice: null,
    maxPrice: null,
    searchTerm: ''
  });
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const apiService = new ApiService();

  // [Chinese comment] 获取所有Marketplace上的内存
  const fetchMemories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const marketMemories = await apiService.getMarketListings();
      // [Chinese comment] 将API返回的MemoryNFT转换为UI使用的Memory
      const convertedMemories = marketMemories.map(convertMemoryNFTToMemory);
      setMemories(convertedMemories);
    } catch (err) {
      console.error('Failed to fetch memories:', err);
      setError('获取内存Marketplace数据失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  // [Chinese comment] 根据过滤器和Sort options更新过滤后的内存列表
  useEffect(() => {
    if (!memories.length) return;

    let result = [...memories];

    // [Chinese comment] 应用搜索条件
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(
        memory => 
          memory.name.toLowerCase().includes(searchLower) || 
          memory.description.toLowerCase().includes(searchLower)
      );
    }

    // [Chinese comment] 应用类型过滤
    if (filters.types.length > 0) {
      result = result.filter(memory => filters.types.includes(memory.memoryType));
    }

    // [Chinese comment] 应用品质过滤
    if (filters.qualities.length > 0) {
      result = result.filter(memory => filters.qualities.includes(memory.quality));
    }

    // Apply price filtering
    if (filters.minPrice !== null) {
      result = result.filter(memory => memory.price !== null && memory.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      result = result.filter(memory => memory.price !== null && memory.price <= filters.maxPrice!);
    }

    // [Chinese comment] 应用排序
    result = sortMemories(result, sortOption);

    setFilteredMemories(result);
  }, [memories, filters, sortOption]);

  // [Chinese comment] 初始化加载数据
  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  // [Chinese comment] 排序内存函数
  const sortMemories = (memoriesToSort: Memory[], option: SortOption): Memory[] => {
    switch (option) {
      case 'price_asc':
        return [...memoriesToSort].sort((a, b) => {
          // [Chinese comment] 将没有价格的项放在最后
          if (a.price === null) return 1;
          if (b.price === null) return -1;
          return a.price - b.price;
        });
      case 'price_desc':
        return [...memoriesToSort].sort((a, b) => {
          if (a.price === null) return 1;
          if (b.price === null) return -1;
          return b.price - a.price;
        });
      case 'quality_asc':
        return [...memoriesToSort].sort((a, b) => {
          const qualityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
          return qualityOrder[a.quality] - qualityOrder[b.quality];
        });
      case 'quality_desc':
        return [...memoriesToSort].sort((a, b) => {
          const qualityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
          return qualityOrder[b.quality] - qualityOrder[a.quality];
        });
      case 'newest':
        return [...memoriesToSort].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return [...memoriesToSort].sort((a, b) =>[Chinese UI text]  
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return memoriesToSort;
    }
  };

  // [Chinese comment] 更新过滤器
  const updateFilter = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // [Chinese comment] 重置所有过滤器
  const resetFilters = () => {
    setFilters({
      types: [],
      qualities: [],
      minPrice: null,
      maxPrice: null,
      searchTerm: ''
    });
    setSortOption('newest');
  };

  // [Chinese comment] 切换类型过滤器
  const toggleTypeFilter = (type: MemoryType) => {
    setFilters(prev => {
      if (prev.types.includes(type)) {
        return { ...prev, types: prev.types.filter(t => t !== type) };
      } else {
        return { ...prev, types: [...prev.types, type] };
      }
    });
  };

  // [Chinese comment] 切换品质过滤器
  const toggleQualityFilter = (quality: MemoryQuality) => {
    setFilters(prev => {
      if (prev.qualities.includes(quality)) {
        return { ...prev, qualities: prev.qualities.filter(q => q !== quality) };
      } else {
        return { ...prev, qualities: [...prev.qualities, quality] };
      }
    });
  };

  // [Chinese comment] 设置价格范围
  const setPriceRange = (min: number | null, max: number | null) => {
    setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
  };

  // [Chinese comment] 设置搜索词
  const setSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  // [Chinese comment] 更新Sort options
  const updateSortOption = (option: SortOption) => {
    setSortOption(option);
  };

  return {
    memories: filteredMemories,
    loading,
    error,
    filters,
    sortOption,
    updateFilter,
    resetFilters,
    toggleTypeFilter,
    toggleQualityFilter,
    setPriceRange,
    setSearchTerm,
    updateSortOption,
    refreshMemories: fetchMemories
  };
} 