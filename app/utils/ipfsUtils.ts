import { create, IPFSHTTPClient } from 'ipfs-http-client';
import config, { getIpfsUrl } from '../config/environment';

// [Chinese comment] 初始化IPFS客户端
let ipfsClient: IPFSHTTPClient | null = null;

const initIPFSClient = () => {
  try {
    const auth = 'Basic ' + Buffer.from(config.infuraApiKey + ':' + config.infuraApiSecret).toString('base64');
    
    ipfsClient = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    });
    
    return ipfsClient;
  } catch (error) {
    console.error('IPFS客户端初始化失败:', error);
    return null;
  }
};

// [Chinese comment] 上传文件到IPFS
export const uploadFileToIPFS = async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
  try {
    if (!ipfsClient) {
      ipfsClient = initIPFSClient();
      if (!ipfsClient) {
        throw new Error('IPFS客户端未初始化');
      }
    }
    
    // [Chinese comment] 检查文件大小是否超过限制
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > config.maxUploadSizeMB) {
      throw new Error(`文件大小超过限制 (${config.maxUploadSizeMB}MB)`);
    }
    
    const fileBuffer = await readFileAsArrayBuffer(file);
    
    const result = await ipfsClient.add(
      { path: file.name, content: fileBuffer },
      { 
        progress: (prog) =>  {
          console.log(`上传进度: ${prog}`);
          if (onProgress) {
            // [Chinese comment] 计算上传进度百分比
            const progressPercent = Math.round((prog / file.size) * 100);
            onProgress(progressPercent);
          }
        }
      }
    );
    
    const ipfsPath = `ipfs://${result.cid.toString()}`;
    console.log('IPFS路径:', ipfsPath);
    
    return ipfsPath;
  } catch (error) {
    console.error('上传文件到IPFS失败:', error);
    throw error;
  }
};

// [Chinese comment] 内存数据接口
export interface MemoryMetadata {
  name: string;
  description: string;
  image: string; // IPFS路径
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  brainRegion?: string;
  emotionalValence?: number; 
  cognitiveLoad?: number;
  memoryType: string;
  quality: string;
  neuralSignature: string;
  timestamp: number;
  creator: string;
}

// [Chinese comment] 上传记忆元数据到IPFS
export const uploadMemoryMetadataToIPFS = async (
  metadata: MemoryMetadata,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    if (!ipfsClient) {
      ipfsClient = initIPFSClient();
      if (!ipfsClient) {
        throw new Error('IPFS客户端未初始化');
      }
    }
    
    // [Chinese comment] 将元数据转换为Buffer
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const metadataSize = metadataBuffer.length;
    
    // [Chinese comment] 上传元数据到IPFS
    const result = await ipfsClient.add(
      { path: 'metadata.json', content: metadataBuffer },
      { 
        progress: (prog) =>  {
          console.log(`上传进度: ${prog}`); 
          if (onProgress) {
            // [Chinese comment] 计算上传进度百分比
            const progressPercent = Math.round((prog / metadataSize) * 100);
            onProgress(progressPercent);
          }
        }
      }
    );
    
    const ipfsPath = `ipfs://${result.cid.toString()}`;
    console.log('元数据IPFS路径:', ipfsPath);
    
    return ipfsPath;
  } catch (error) {
    console.error('上传元数据到IPFS失败:', error);
    throw error;
  }
};

// [Chinese comment] 辅助函数：将File对象读取为ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && event.target.result instanceof ArrayBuffer) {
        resolve(event.target.result);
      } else {
        reject(new Error('无法读取文件'));
      }
    };
    
    reader.onerror = (error) =>  {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// [Chinese comment] 从IPFSGet memory metadata
export const getMemoryMetadataFromIPFS = async (ipfsUri: string): Promise<MemoryMetadata> => {
  try {
    // [Chinese comment] 使用配置中的IPFS网关
    const fetchUrl = getIpfsUrl(ipfsUri);
    
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error(`获取元数据失败: ${response.statusText}`);
    }
    
    const metadata = await response.json();
    return metadata as MemoryMetadata;
  } catch (error) {
    console.error('从IPFS获取元数据失败:', error);
    throw error;
  }
};

// [Chinese comment] 从IPFS获取图像URL
export const getImageUrlFromIPFS = (ipfsUri: string): string => {
  if (!ipfsUri) return '';
  return getIpfsUrl(ipfsUri);
};

// [Chinese comment] 批量上传多个文件
export const uploadMultipleFilesToIPFS = async (
  files: File[],
  onFileProgress?: (index: number, progress: number) => void,
  onTotalProgress?: (progress: number) => void
): Promise<string[]> => {
  const ipfsPaths: string[] = [];
  let totalProgress = 0;
  const increment = 100 / files.length;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const path = await uploadFileToIPFS(
        file,
        (progress) =>  {
          // [Chinese comment] 报告单个文件进度
          if (onFileProgress) {
            onFileProgress(i, progress);
          }
          
          // [Chinese comment] 更新总体进度
          if (onTotalProgress) {
            const fileContribution = progress * increment / 100;
            const newTotalProgress = totalProgress + fileContribution;
            onTotalProgress(Math.min(newTotalProgress, 100));
          }
        }
      );
      
      ipfsPaths.push(path);
      totalProgress += increment;
      
      if (onTotalProgress) {
        onTotalProgress(Math.min(totalProgress, 100));
      }
    } catch (error) {
      console.error(`上传文件 ${i + 1}/${files.length} 时出错:`, error);
      throw error;
    }
  }
  
  return ipfsPaths;
};

// [Chinese comment] 从ArrayBuffer创建神经指纹
export const generateNeuralFingerprint = async (data: ArrayBuffer): Promise<string> => {
  try {
    // [Chinese comment] 在实际应用中，这将是一个复杂的算法，
    // [Chinese comment] 使用神经网络或其他机器学习技术从脑电图数据生成指纹
    
    // [Chinese comment] 这里用简单的哈希算法模拟
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `0x${hashHex}`;
  } catch (error) {
    console.error('生成神经指纹失败:', error);
    throw error;
  }
}; 