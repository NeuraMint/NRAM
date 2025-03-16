import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';

// [Chinese comment] 环境枚举
export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

/**
 * 环境配置接口
 */
export interface EnvironmentConfig {
  /** API服务器URL */
  apiUrl: string;
  /** Solana集群URL */
  clusterUrl: string;
  /** 是否为开发环境 */
  isDevelopment: boolean;
  /** 是否使用模拟数据 */
  useMockData: boolean;
  /** 记忆合约程序ID */
  memoryProgramId: string;
  /** Validate者合约程序ID */
  validatorProgramId: string;
}

/**
 * 开发环境配置
 */
const devConfig: EnvironmentConfig = {
  apiUrl: 'http://localhost:3001/api',
  clusterUrl: 'https://api.devnet.solana.com',
  isDevelopment: true,
  useMockData: true,
  memoryProgramId: 'MemXQEHpXcYeJRpQhsqwKyxPzEXAKiK4qhMz2vmgWNT',
  validatorProgramId: 'Va1nQzxr86P7MWjGxvXk3QEHnbJ4fQPnhTXEFp8zxSJ',
};

/**
 * 生产环境配置
 */
const prodConfig: EnvironmentConfig = {
  apiUrl: 'https://api.neuramint.tech/api',
  clusterUrl: 'https://api.mainnet-beta.solana.com',
  isDevelopment: false,
  useMockData: false,
  memoryProgramId: 'MemXQEHpXcYeJRpQhsqwKyxPzEXAKiK4qhMz2vmgWNT',
  validatorProgramId: 'Va1nQzxr86P7MWjGxvXk3QEHnbJ4fQPnhTXEFp8zxSJ',
};

/**
 * 获取当前环境
 * @returns 当前环境
 */
export function getEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT;
  
  switch (env) {
    case 'production':
      return Environment.PRODUCTION;
    case 'staging':
      return Environment.STAGING;
    case 'development':
      return Environment.DEVELOPMENT;
    default:
      return Environment.LOCAL;
  }
}

/**
 * 获取当前环境配置
 * @returns 环境配置对象
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  // [Chinese comment] 检查环境变量或window.location确定当前环境
  const isProduction = 
    process.env.NODE_ENV === 'production' ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost');
  
  // [Chinese comment] 合并默认配置和环境变量中的自定义配置
  const config = isProduction ? { ...prodConfig } : { ...devConfig };
  
  // [Chinese comment] 允许通过环境变量覆盖配置
  if (process.env.NEXT_PUBLIC_API_URL) {
    config.apiUrl = process.env.NEXT_PUBLIC_API_URL;
  }
  
  if (process.env.NEXT_PUBLIC_CLUSTER_URL) {
    config.clusterUrl = process.env.NEXT_PUBLIC_CLUSTER_URL;
  }
  
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    config.useMockData = true;
  } else if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false') {
    config.useMockData = false;
  }
  
  if (process.env.NEXT_PUBLIC_MEMORY_PROGRAM_ID) {
    config.memoryProgramId = process.env.NEXT_PUBLIC_MEMORY_PROGRAM_ID;
  }
  
  if (process.env.NEXT_PUBLIC_VALIDATOR_PROGRAM_ID) {
    config.validatorProgramId = process.env.NEXT_PUBLIC_VALIDATOR_PROGRAM_ID;
  }
  
  return config;
}

/**
 * 生成IPFS URL
 * @param cid IPFS内容标识符
 * @returns IPFS URL
 */
export function getIpfsUrl(cid: string): string {
  const config = getEnvironmentConfig();
  return `${config.apiUrl}${cid}`;
}

/**
 * 获取程序ID的短版本（用于显示）
 * @param programId 程序ID
 * @returns 短版本的程序ID
 */
export function getShortProgramId(programId: string | PublicKey): string {
  const id = typeof programId === 'string' ? programId : programId.toString();
  if (id.length <= 8) return id;
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
}

/**
 * 格式化Solana SOL金额（从lamports转换为SOL）
 * @param lamports lamports数量
 * @param decimals 显示的小数位数
 * @returns 格式化后的SOL金额字符串
 */
export function formatSol(lamports: number, decimals: number = 3): string {
  const sol = lamports / 1_000_000_000; // 1 SOL = 10^9 lamports
  return sol.toFixed(decimals);
}

/**
 * 将SOLConvert to lamports
 * @param sol SOL数量
 * @returns lamports数量
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000);
}

/**
 * 获取区块浏览器URL
 * @param address 地址或交易签名
 * @param type 类型：'address'、'tx'或'token'
 * @returns 区块浏览器URL
 */
export function getExplorerUrl(address: string, type: 'address' | 'tx' | 'token' = 'address'): string {
  const config = getEnvironmentConfig();
  const baseUrl = config.isDevelopment 
    ? 'https://explorer.solana.com' 
    : 'https://explorer.solana.com';
  
  const cluster = config.isDevelopment ? '?cluster=devnet' : '';
  
  switch (type) {
    case 'tx':
      return `${baseUrl}/tx/${address}${cluster}`;
    case 'token':
      return `${baseUrl}/token/${address}${cluster}`;
    case 'address':
    default:
      return `${baseUrl}/address/${address}${cluster}`;
  }
} 