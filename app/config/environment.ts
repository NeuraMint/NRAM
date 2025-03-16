import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// 环境变量枚举
export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

// 环境配置接口
export interface EnvironmentConfig {
  environment: Environment;
  apiUrl: string;
  ipfsGateway: string;
  infuraApiKey: string;
  infuraApiSecret: string;
  solanaNetwork: WalletAdapterNetwork;
  memoryNftProgramId: string;
  memoryValidatorProgramId: string;
  featuredMemoryIds: string[];
  rpcEndpoint: string;
  maxUploadSizeMB: number;
  validationEnabled: boolean;
}

// 默认环境配置
const defaultConfig: Partial<EnvironmentConfig> = {
  ipfsGateway: 'https://gateway.ipfs.io/ipfs/',
  maxUploadSizeMB: 50,
  validationEnabled: true,
  featuredMemoryIds: [
    '1', '2', '3', '4', '5', '6'
  ]
};

// 本地环境配置
const localConfig: EnvironmentConfig = {
  ...defaultConfig as EnvironmentConfig,
  environment: Environment.LOCAL,
  apiUrl: 'http://localhost:3001/api',
  solanaNetwork: WalletAdapterNetwork.Devnet,
  memoryNftProgramId: 'YourLocalMemoryNftProgramId111111111111111111111111',
  memoryValidatorProgramId: 'YourLocalMemoryValidatorProgramId1111111111111111111',
  rpcEndpoint: 'http://localhost:8899',
  infuraApiKey: 'YOUR_INFURA_API_KEY',
  infuraApiSecret: 'YOUR_INFURA_API_SECRET',
};

// 开发环境配置
const developmentConfig: EnvironmentConfig = {
  ...defaultConfig as EnvironmentConfig,
  environment: Environment.DEVELOPMENT,
  apiUrl: 'https://dev-api.neuramint.tech/api',
  solanaNetwork: WalletAdapterNetwork.Devnet,
  memoryNftProgramId: 'YourDevnetMemoryNftProgramId111111111111111111111111',
  memoryValidatorProgramId: 'YourDevnetMemoryValidatorProgramId1111111111111111',
  rpcEndpoint: 'https://api.devnet.solana.com',
  infuraApiKey: 'YOUR_INFURA_API_KEY',
  infuraApiSecret: 'YOUR_INFURA_API_SECRET',
};

// 预发布环境配置
const stagingConfig: EnvironmentConfig = {
  ...defaultConfig as EnvironmentConfig,
  environment: Environment.STAGING,
  apiUrl: 'https://staging-api.neuramint.tech/api',
  solanaNetwork: WalletAdapterNetwork.Testnet,
  memoryNftProgramId: 'YourTestnetMemoryNftProgramId11111111111111111111111',
  memoryValidatorProgramId: 'YourTestnetMemoryValidatorProgramId111111111111111',
  rpcEndpoint: 'https://api.testnet.solana.com',
  infuraApiKey: 'YOUR_INFURA_API_KEY',
  infuraApiSecret: 'YOUR_INFURA_API_SECRET',
};

// 生产环境配置
const productionConfig: EnvironmentConfig = {
  ...defaultConfig as EnvironmentConfig,
  environment: Environment.PRODUCTION,
  apiUrl: 'https://api.neuramint.tech/api',
  solanaNetwork: WalletAdapterNetwork.Mainnet,
  memoryNftProgramId: 'YourMainnetMemoryNftProgramId11111111111111111111111',
  memoryValidatorProgramId: 'YourMainnetMemoryValidatorProgramId111111111111111',
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  infuraApiKey: process.env.INFURA_API_KEY || 'YOUR_INFURA_API_KEY',
  infuraApiSecret: process.env.INFURA_API_SECRET || 'YOUR_INFURA_API_SECRET',
};

// 确定当前环境
const determineEnvironment = (): Environment => {
  const envFromProcess = process.env.NEXT_PUBLIC_ENVIRONMENT;
  
  if (envFromProcess) {
    switch (envFromProcess.toLowerCase()) {
      case 'local':
        return Environment.LOCAL;
      case 'development':
        return Environment.DEVELOPMENT;
      case 'staging':
        return Environment.STAGING;
      case 'production':
        return Environment.PRODUCTION;
      default:
        return Environment.DEVELOPMENT;
    }
  }
  
  // 默认为开发环境
  return Environment.DEVELOPMENT;
};

// 获取当前环境的配置
const getConfig = (): EnvironmentConfig => {
  const env = determineEnvironment();
  
  switch (env) {
    case Environment.LOCAL:
      return localConfig;
    case Environment.DEVELOPMENT:
      return developmentConfig;
    case Environment.STAGING:
      return stagingConfig;
    case Environment.PRODUCTION:
      return productionConfig;
    default:
      return developmentConfig;
  }
};

// 导出当前环境配置
export const config = getConfig();

// 导出辅助函数
export const isLocal = () => config.environment === Environment.LOCAL;
export const isDevelopment = () => config.environment === Environment.DEVELOPMENT;
export const isStaging = () => config.environment === Environment.STAGING;
export const isProduction = () => config.environment === Environment.PRODUCTION;
export const isDevOrLocal = () => isLocal() || isDevelopment();

/**
 * 获取 IPFS 网关的完整 URL
 * @param cid IPFS内容标识符
 * @returns 完整的IPFS访问URL
 */
export const getIpfsUrl = (cid: string): string => {
  if (!cid) return '';
  
  // 如果CID已经包含完整URL，直接返回
  if (cid.startsWith('http')) {
    return cid;
  }
  
  // 确保CID不包含ipfs://前缀
  const cleanCid = cid.replace('ipfs://', '');
  
  return `${config.ipfsGateway}${cleanCid}`;
};

/**
 * 从程序ID获取程序地址的缩写显示形式
 * @param programId 程序ID
 * @returns 缩写的程序ID，例如 "YourM...11111"
 */
export const getShortProgramId = (programId: string): string => {
  if (!programId || programId.length < 10) return programId;
  return `${programId.substring(0, 5)}...${programId.substring(programId.length - 5)}`;
};

export default config; 