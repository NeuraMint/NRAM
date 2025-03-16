import { getEnvironmentConfig } from '../utils/environment';
import { PublicKey } from '@solana/web3.js';

// APIResponse interface
interface ApiResponse<T>[Chinese UI text]  {
  success: boolean;
  data?: T;
  error?: string;
}

// Memory NFT interface
export interface MemoryNFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  neuralFingerprint: string;
  creator: string;
  owner: string;
  mintAddress: string;
  type: string;
  quality: string;
  intensity: number;
  createdAt: string;
  isListed: boolean;
  price?: number;
  isTransferable: boolean;
}

// Validator interface
export interface Validator {
  publicKey: string;
  stakedAmount: number;
  completedValidations: number;
  successRate: number;
  totalRewards: number;
  pendingRewards: number;
  reputation: number;
  isActive: boolean;
  registeredAt: string;
}

// Validation record interface
export interface ValidationRecord {
  id: string;
  validator: string;
  memoryId: string;
  memoryName: string;
  score: number;
  isValid: boolean;
  comment: string;
  processed: boolean;
  rewarded: boolean;
  rewardAmount: number;
  createdAt: string;
}

// Create Memory请求接口
export interface CreateMemoryRequest {
  name: string;
  description: string;
  imageFile: File;
  neuralData: string;
  type: string;
  intensity: number;
  isTransferable: boolean;
}

// Create validation request interface
export interface CreateValidationRequest {
  memoryId: string;
  score: number;
  isValid: boolean;
  comment?: string;
}

/**
 * API服务类 - 处理所有与后端API的交互
 */
export class ApiService {
  private baseUrl: string;
  
  constructor() {
    const config = getEnvironmentConfig();
    this.baseUrl = config.apiUrl;
  }
  
  /**
   * 通用GET请求方法
   * @param endpoint API端点
   * @returns 响应数据
   */
  private async get<T>(endpoint: string): Promise<T>[Chinese UI text]  {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const result: ApiResponse<T>[Chinese UI text]  = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '未知API错误');
      }
      
      return result.data as T;
    } catch (error) {
      console.error(`GET请求失败 ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * 通用POST请求方法
   * @param endpoint API端点
   * @param data 请求数据
   * @returns 响应数据
   */
  private async post<T, R>(endpoint: string, data: T): Promise<R>[Chinese UI text]  {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }
      
      const result: ApiResponse<R>[Chinese UI text]  = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '未知API错误');
      }
      
      return result.data as R;
    } catch (error) {
      console.error(`POST请求失败 ${endpoint}:`, error);
      throw error;
    }
  }
  
  /**
   * 获取所有记忆NFT
   * @returns 记忆NFT数组
   */
  async getAllMemories(): Promise<MemoryNFT[]> {
    try {
      return await this.get<MemoryNFT[]>[Chinese UI text] ('/memories');
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      return this.getMockMemories();
    }
  }
  
  /**
   * 获取记忆Marketplace列表（已上架的记忆）
   * @returns 已上架的记忆NFT数组
   */
  async getMarketListings(): Promise<MemoryNFT[]> {
    try {
      return await this.get<MemoryNFT[]>('/market/listings');
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      const allMemories = this.getMockMemories();
      return allMemories.filter(memory =>[Chinese UI text]  memory.isListed);
    }
  }
  
  /**
   * 获取用户拥有的记忆NFT
   * @param ownerAddress 所有者地址
   * @returns 用户拥有的记忆NFT数组
   */
  async getUserMemories(ownerAddress: string): Promise<MemoryNFT[]> {
    try {
      return await this.get<MemoryNFT[]>(`/memories/owner/${ownerAddress}`);
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      const allMemories = this.getMockMemories();
      return allMemories.filter(memory =>[Chinese UI text]  memory.owner === ownerAddress);
    }
  }
  
  /**
   * 获取记忆NFT详情
   * @param memoryId 记忆ID
   * @returns 记忆NFT详情
   */
  async getMemoryById(memoryId: string): Promise<MemoryNFT> {
    try {
      return await this.get<MemoryNFT>(`/memories/${memoryId}`);
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      const allMemories = this.getMockMemories();
      const memory = allMemories.find(m =>[Chinese UI text]  m.id === memoryId);
      
      if (!memory) {
        throw new Error(`未找到ID为${memoryId}的记忆`);
      }
      
      return memory;
    }
  }
  
  /**
   * 创建新记忆NFT
   * @param memoryData 记忆数据
   * @param walletAddress 钱包地址
   * @returns 创建的记忆NFT
   */
  async createMemory(memoryData: CreateMemoryRequest, walletAddress: string): Promise<MemoryNFT> {
    // In the actual implementation, this would call an API to upload images and data
    // Since this is a simplified version, we return mock data directly
    await new Promise(resolve =>[Chinese UI text]  setTimeout(resolve, 2000)); // Simulate network delay
    
    const newMemory: MemoryNFT = {
      id: `memory_${Date.now()}`,
      name: memoryData.name,
      description: memoryData.description,
      imageUrl: URL.createObjectURL(memoryData.imageFile),
      neuralFingerprint: memoryData.neuralData,
      creator: walletAddress,
      owner: walletAddress,
      mintAddress: new PublicKey(walletAddress).toString(),
      type: memoryData.type,
      quality: 'High',
      intensity: memoryData.intensity,
      createdAt: new Date().toISOString(),
      isListed: false,
      isTransferable: memoryData.isTransferable,
    };
    
    return newMemory;
  }
  
  /**
   * submitted记忆Validate
   * @param validationData Validate数据
   * @param validatorAddress Validate者地址
   * @returns Validate记录
   */
  async submitValidation(
    validationData: CreateValidationRequest,
    validatorAddress: string
  ): Promise<ValidationRecord> {
    try {
      return await this.post<CreateValidationRequest, ValidationRecord>(
        '/validations',
        validationData
      );
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      
      // Simulate delay
      await new Promise(resolve =>[Chinese UI text]  setTimeout(resolve, 1500));
      
      // Return mock validation records
      return {
        id: `validation_${Date.now()}`,
        validator: validatorAddress,
        memoryId: validationData.memoryId,
        memoryName: '模拟Memory name',
        score: validationData.score,
        isValid: validationData.isValid,
        comment: validationData.comment || '',
        processed: false,
        rewarded: false,
        rewardAmount: 0,
        createdAt: new Date().toISOString(),
      };
    }
  }
  
  /**
   * 获取Validate者信息
   * @param validatorAddress Validate者地址
   * @returns Validate者信息
   */
  async getValidator(validatorAddress: string): Promise<Validator | null> {
    try {
      return await this.get<Validator>[Chinese UI text] (`/validators/${validatorAddress}`);
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      
      // Mock validator data
      return {
        publicKey: validatorAddress,
        stakedAmount: 1000000000, // 1 SOL
        completedValidations: 42,
        successRate: 95.2,
        totalRewards: 1250000000, // 1.25 SOL
        pendingRewards: 250000000, // 0.25 SOL
        reputation: 87,
        isActive: true,
        registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天前
      };
    }
  }
  
  /**
   * 获取Validate者的Validate历史
   * @param validatorAddress Validate者地址
   * @returns Validate记录数组
   */
  async getValidatorHistory(validatorAddress: string): Promise<ValidationRecord[]> {
    try {
      return await this.get<ValidationRecord[]>[Chinese UI text] (`/validations/validator/${validatorAddress}`);
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      
      // Generate mock validation history
      const now = Date.now();
      const mockHistory: ValidationRecord[] = [];
      
      for (let i = 0; i < 10; i++) {
        const timestamp = now - i * 24 * 60 * 60 * 1000; // One record per day
        const score = Math.floor(Math.random() * 40) + 60; // 60-100之间的分数
        
        mockHistory.push({
          id: `validation_${timestamp}`,
          validator: validatorAddress,
          memoryId: `memory_${i + 1}`,
          memoryName: `示例Memory #${i + 1}`,
          score,
          isValid: score >= 60,
          comment: score >[Chinese UI text] = 80 ? '高质量记忆，细节丰富' : '记忆基本真实，但有些细节模糊',
          processed: i < 8, // The last two records are unprocessed
          rewarded: i < 8, // All processed records have rewards
          rewardAmount: i < 8 ? 0.05 : 0,
          createdAt: new Date(timestamp).toISOString(),
        });
      }
      
      return mockHistory;
    }
  }
  
  /**
   * 获取Validate者排行榜
   * @returns Validate者排名数组
   */
  async getValidatorRankings(): Promise<Validator[]> {
    try {
      return await this.get<Validator[]>[Chinese UI text] ('/validators/rankings');
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      
      // Mock validator leaderboard
      const mockRankings: Validator[] = [];
      
      for (let i = 0; i < 10; i++) {
        mockRankings.push({
          publicKey: `Validator${i + 1}...`,
          stakedAmount: (2 - i * 0.1) * 1000000000, // Decreasing stake amount
          completedValidations: 200 - i * 15,
          successRate: 98 - i * 0.8,
          totalRewards: (3 - i * 0.2) * 1000000000,
          pendingRewards: (0.5 - i * 0.05) * 1000000000,
          reputation: 95 - i * 2,
          isActive: true,
          registeredAt: new Date(Date.now() - (i + 1) * 15 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      
      return mockRankings;
    }
  }
  
  /**
   * Register as a validator
   * @param walletAddress 钱包地址
   * @param stakeAmount 质押金额 (lamports)
   * @returns Validate者信息
   */
  async registerValidator(walletAddress: string, stakeAmount: number): Promise<Validator> {
    try {
      return await this.post<{ stakeAmount: number }, Validator>(
        `/validators/register/${walletAddress}`,
        { stakeAmount }
      );
    } catch (error) {
      // Return mock data when the actual API is unavailable
      console.warn('使用模拟数据代替API调用');
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // [Chinese comment] 返回Mock validator data
      return {
        publicKey: walletAddress,
        stakedAmount: stakeAmount,
        completedValidations: 0,
        successRate: 0,
        totalRewards: 0,
        pendingRewards: 0,
        reputation: 50, // Initial reputation value
        isActive: true,
        registeredAt: new Date().toISOString(),
      };
    }
  }
  
  /**
   * 模拟方法：获取模拟记忆数据
   * @returns 模拟记忆NFT数组
   */
  private getMockMemories(): MemoryNFT[] {
    const memoryTypes = ['旅行', '情感', '学习', '成就', '日常'];
    const qualityLevels = ['High', 'Medium', 'Low'];
    
    return Array(15).fill(0).map((_, i) => ({
      id: `memory_${i + 1}`,
      name: `示例Memory #${i + 1}`,
      description: `这是一个关于${memoryTypes[i % memoryTypes.length]}的记忆样本描述。这段文字会详细描述记忆的内容和背景。`,
      imageUrl: `/images/memories/sample${(i % 5) + 1}.jpg`,
      neuralFingerprint: `nfp_${Math.random().toString(36).substring(2, 15)}`,
      creator: `Creator${Math.floor(i / 3) + 1}`,
      owner: `Owner${Math.floor(i / 5) + 1}`,
      mintAddress: `mint${i + 1}`,
      type: memoryTypes[i % memoryTypes.length],
      quality: qualityLevels[i % qualityLevels.length],
      intensity: Math.floor(Math.random() * 50) + 50, // 50-100之间的强度
      createdAt: new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000).toISOString(), // One every 3 days
      isListed: i % 3 === 0, // One out of every 3 is listed
      price: i % 3 === 0 ? (Math.floor(Math.random() * 10) + 1) / 10 : undefined, // 0.1-1.0 SOL
      isTransferable: i % 4 !== 0, // 75%可转让
    }));
  }
} 