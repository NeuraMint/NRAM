import { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { MintService } from '../../../services/mintService';
import { getImageUrlFromIPFS, getMemoryMetadataFromIPFS } from '../../../utils/ipfsUtils';
import { MemoryQuality, MemoryType } from '../../../components/MemoryCard';
import config from '../../../config/environment';

// [Chinese comment] 内存详细信息接口
interface MemoryDetail {
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
  creator: string;
  price?: number;
  forSale: boolean;
  transferable: boolean;
  validationStatus: 'pending' | 'validated' | 'rejected';
  validationScore?: number;
  validationCount?: number;
  validations?: {
    validator: string;
    score: number;
    comment?: string;
    timestamp: number;
  }[];
  history?: {
    type: 'mint' | 'transfer' | 'validation' | 'price_change' | 'sale';
    from?: string;
    to?: string;
    price?: number;
    timestamp: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只支持GET请求' });
  }

  try {
    // [Chinese comment] 获取路径参数中的记忆ID
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '缺少有效的记忆ID' });
    }
    
    // Initialize service
    const mintService = new MintService();
    
    // [Chinese comment] 连接Solana网络
    const connection = new Connection(config.rpcEndpoint);
    
    // [Chinese comment] 将ID转换为PublicKey
    let mintPublicKey: PublicKey;
    try {
      mintPublicKey = new PublicKey(id);
    } catch (error) {
      return res.status(400).json({ error: '无效的记忆ID格式' });
    }
    
    // [Chinese comment] 获取记忆详细信息
    const memoryDetail = await fetchMemoryDetail(mintService, connection, mintPublicKey);
    
    if (!memoryDetail) {
      return res.status(404).json({ error: '记忆不存在或无法访问' });
    }
    
    // [Chinese comment] 返回结果
    return res.status(200).json(memoryDetail);
  } catch (error) {
    console.error('获取记忆详细信息时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}

// [Chinese comment] 获取单个记忆详细信息
async function fetchMemoryDetail(
  mintService: MintService, 
  connection: Connection, 
  mint: PublicKey
): Promise<MemoryDetail | null> {
  try {
    // [Chinese comment] 获取链上数据
    const memoryData = await mintService.getMemoryData(mint);
    
    if (!memoryData) {
      return null;
    }
    
    // [Chinese comment] 获取IPFS元数据
    const metadata = await getMemoryMetadataFromIPFS(memoryData.uri);
    
    // [Chinese comment] 获取价格信息（如果有）
    let price: number | undefined = undefined;
    let forSale = false;
    
    // [Chinese comment] 这里可以添加获取记忆Marketplace价格的逻辑
    // [Chinese comment] 例如从程序化Marketplace获取上架信息
    
    // [Chinese comment] 获取Validate信息
    const validations = await fetchValidations(mintService, mint);
    
    // [Chinese comment] 获取交易历史
    const history = await fetchMemoryHistory(connection, mint);
    
    // [Chinese comment] 构建完整的记忆详情
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
      creator: metadata.creator,
      price,
      forSale,
      transferable: memoryData.transferable,
      validationStatus: determineValidationStatus(memoryData),
      validationScore: memoryData.validationScore?.toNumber(),
      validationCount: validations?.length || 0,
      validations,
      history,
    };
  } catch (error) {
    console.error(`获取记忆 ${mint.toString()} 详细信息时出错:`, error);
    return null;
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

// [Chinese comment] 获取Validate信息
async function fetchValidations(mintService: MintService, mint: PublicKey) {
  try {
    // [Chinese comment] 这里应该调用ValidationService从Validate程序获取Validate信息
    // [Chinese comment] 由于我们还没有实现这部分功能，返回一个空数组
    return [];
  } catch (error) {
    console.error(`获取记忆 ${mint.toString()} Validate信息时出错:`, error);
    return [];
  }
}

// [Chinese comment] 获取记忆交易历史
async function fetchMemoryHistory(connection: Connection, mint: PublicKey) {
  try {
    // [Chinese comment] 获取代币的交易历史
    // [Chinese comment] 这需要使用Solana的getProgramAccounts或getSignaturesForAddress API
    // [Chinese comment] 由于这是一个复杂的操作，这里我们返回一个模拟的历史记录
    return [
      {
        type: 'mint' as const,
        to: '...',  // [Chinese comment] 这里应该是创建者的公钥
        timestamp: Date.now() - 1000000,  // [Chinese comment] 一段时间前
      }
    ];
  } catch (error) {
    console.error(`获取记忆 ${mint.toString()} 交易历史时出错:`, error);
    return [];
  }
} 