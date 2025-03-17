import { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { MintService } from '../../../services/mintService';
import { getImageUrlFromIPFS, getMemoryMetadataFromIPFS } from '../../../utils/ipfsUtils';
import { MemoryQuality, MemoryType } from '../../../components/MemoryCard';
import config from '../../../config/environment';

// [Chinese comment] 内存数据接口，包含前端显示所需的所有信息
interface MemoryItem {
  mint: string;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
  quality: MemoryQuality;
  memoryType: MemoryType;
  brainRegion?: string;
  emotionalValence?: number;
  cognitiveLoad?: number;
  neuralSignature: string;
  timestamp: number;
  price?: number;
  forSale: boolean;
  transferable: boolean;
  validationStatus: 'pending' | 'validated' | 'rejected';
  validationScore?: number;
}

// [Chinese comment] 筛选参数接口
interface FilterParams {
  owner?: string;
  types?: MemoryType[];
  qualities?: MemoryQuality[];
  minPrice?: number;
  maxPrice?: number;
  forSale?: boolean;
  validated?: boolean;
  search?: string;
  sortBy?: 'timestamp' | 'price' | 'quality' | 'validationScore';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只支持GET请求' });
  }

  try {
    // [Chinese comment] 解析查询参数
    const {
      owner,
      types,
      qualities,
      minPrice,
      maxPrice,
      forSale,
      validated,
      search,
      sortBy = 'timestamp',
      sortDirection = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    // [Chinese comment] 构建筛选参数
    const filters: FilterParams = {};
    
    if (owner) filters.owner = owner as string;
    if (types) filters.types = (types as string).split(',') as MemoryType[];
    if (qualities) filters.qualities = (qualities as string).split(',') as MemoryQuality[];
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (forSale !== undefined) filters.forSale = forSale === 'true';
    if (validated !== undefined) filters.validated = validated === 'true';
    if (search) filters.search = search as string;
    if (sortBy) filters.sortBy = sortBy as 'timestamp' | 'price' | 'quality' | 'validationScore';
    if (sortDirection) filters.sortDirection = sortDirection as 'asc' | 'desc';
    if (page) filters.page = Number(page);
    if (limit) filters.limit = Number(limit);

    // Initialize service
    const mintService = new MintService();
    
    // [Chinese comment] 连接Solana网络
    const connection = new Connection(config.rpcEndpoint);
    
    // [Chinese comment] 获取所有记忆
    const allMemories = await fetchAllMemories(mintService, connection);
    
    // [Chinese comment] 应用筛选条件
    const filteredMemories = filterMemories(allMemories, filters);
    
    // [Chinese comment] 应用排序
    const sortedMemories = sortMemories(filteredMemories, filters.sortBy!, filters.sortDirection!);
    
    // [Chinese comment] 应用分页
    const paginatedMemories = paginateMemories(sortedMemories, filters.page!, filters.limit!);
    
    // [Chinese comment] 返回结果
    return res.status(200).json({
      memories: paginatedMemories,
      total: filteredMemories.length,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(filteredMemories.length / filters.limit!),
    });
  } catch (error) {
    console.error('获取记忆列表时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

// [Chinese comment] 获取所有记忆
async function fetchAllMemories(mintService: MintService, connection: Connection): Promise<MemoryItem[]> {
  try {
    // [Chinese comment] 获取全部记忆铸币厂地址
    const memoryMints = await mintService.getAllMemories();
    
    // [Chinese comment] 获取每个记忆的详细信息
    const memories = await Promise.all(
      memoryMints.map(async (mint) => {
        try {
          const memoryData = await mintService.getMemoryData(mint);
          const metadata = await getMemoryMetadataFromIPFS(memoryData.uri);
          
          // [Chinese comment] 获取价格信息（如果有）
          let price: number | undefined = undefined;
          let forSale = false;
          
          // [Chinese comment] 这里可以添加获取记忆Marketplace价格的逻辑
          // [Chinese comment] 例如从程序化Marketplace获取上架信息
          
          // [Chinese comment] 转换为MemoryItem
          return {
            mint: mint.toString(),
            owner: memoryData.owner.toString(),
            name: metadata.name,
            description: metadata.description,
            imageUrl: getImageUrlFromIPFS(metadata.image),
            quality: metadata.quality as MemoryQuality,
            memoryType: metadata.memoryType as MemoryType,
            brainRegion: metadata.brainRegion,
            emotionalValence: metadata.emotionalValence,
            cognitiveLoad: metadata.cognitiveLoad,
            neuralSignature: metadata.neuralSignature,
            timestamp: memoryData.timestamp.toNumber(),
            price,
            forSale,
            transferable: memoryData.transferable,
            validationStatus: determineValidationStatus(memoryData),
            validationScore: memoryData.validationScore?.toNumber(),
          } as MemoryItem;
        } catch (error) {
          console.error(`获取记忆 ${mint.toString()} 详细信息时出错:`, error);
          return null;
        }
      })
    );
    
    // [Chinese comment] 过滤掉获取失败的记忆
    return memories.filter(Boolean) as MemoryItem[];
  } catch (error) {
    console.error('获取全部记忆时出错:', error);
    throw error;
  }
}

// [Chinese comment] 确定Validate状态
function determineValidationStatus(memoryData: any): 'pending' | 'validated' | 'rejected' {
  if (!memoryData.validationStatus || memoryData.validationStatus.toNumber() === 0) {
    return 'pending';
  } else if (memoryData.validationStatus.toNumber() === 1) {
    return 'validated';
  } else {
    return 'rejected';
  }
}

// [Chinese comment] 筛选记忆
function filterMemories(memories: MemoryItem[], filters: FilterParams): MemoryItem[] {
  return memories.filter(memory =>  {
    // [Chinese comment] 按拥有者筛选
    if (filters.owner && memory.owner !== filters.owner) {
      return false;
    }
    
    // [Chinese comment] 按类型筛选
    if (filters.types && !filters.types.includes(memory.memoryType)) {
      return false;
    }
    
    // [Chinese comment] 按质量筛选
    if (filters.qualities && !filters.qualities.includes(memory.quality)) {
      return false;
    }
    
    // [Chinese comment] 按价格范围筛选
    if (filters.minPrice !== undefined && (!memory.price || memory.price < filters.minPrice)) {
      return false;
    }
    if (filters.maxPrice !== undefined && (!memory.price || memory.price >  filters.maxPrice)) {
      return false;
    }
    
    // [Chinese comment] 按出售状态筛选
    if (filters.forSale !== undefined && memory.forSale !== filters.forSale) {
      return false;
    }
    
    // [Chinese comment] 按Validate状态筛选
    if (filters.validated !== undefined) {
      if (filters.validated && memory.validationStatus !== 'validated') {
        return false;
      } else if (!filters.validated && memory.validationStatus === 'validated') {
        return false;
      }
    }
    
    // [Chinese comment] 按关键词搜索
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const nameMatch = memory.name.toLowerCase().includes(searchLower);
      const descMatch = memory.description.toLowerCase().includes(searchLower);
      const regionMatch = memory.brainRegion ? memory.brainRegion.toLowerCase().includes(searchLower) : false;
      
      if (!nameMatch && !descMatch && !regionMatch) {
        return false;
      }
    }
    
    return true;
  });
}

// [Chinese comment] 排序记忆
function sortMemories(
  memories: MemoryItem[],
  sortBy: 'timestamp' | 'price' | 'quality' | 'validationScore',
  sortDirection: 'asc' | 'desc'
): MemoryItem[] {
  const qualityOrder: Record<MemoryQuality, number> = {
    common: 1,
    fine: 2,
    excellent: 3,
    legendary: 4,
  };
  
  return [...memories].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'timestamp') {
      comparison = a.timestamp - b.timestamp;
    } else if (sortBy === 'price') {
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      comparison = priceA - priceB;
    } else if (sortBy === 'quality') {
      comparison = qualityOrder[a.quality] - qualityOrder[b.quality];
    } else if (sortBy === 'validationScore') {
      const scoreA = a.validationScore || 0;
      const scoreB = b.validationScore || 0;
      comparison = scoreA - scoreB;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

// [Chinese comment] 分页
function paginateMemories(memories: MemoryItem[], page: number, limit: number): MemoryItem[] {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return memories.slice(startIndex, endIndex);
} 