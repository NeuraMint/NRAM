import { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { MintService } from '../../../services/mintService';
import { getMemoryMetadataFromIPFS } from '../../../utils/ipfsUtils';

// Request body interface
interface BuyRequestBody {
  memoryMint: string;       // Memory NFT mint address
  buyerPublicKey: string;   // Buyer wallet address
  price: number;            // [Chinese comment] 购买价格
  signature?: string;       // Signed transaction signature (optional, for client signing mode)
}

// Response interface
interface BuyResponseData {
  success: boolean;
  transactionSignature?: string;
  message?: string;
  memory?: {
    mint: string;
    name: string;
    imageUrl: string;
    price: number;
    seller: string;
    buyer: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BuyResponseData | { error: string }>
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    // Parse request body
    const { memoryMint, buyerPublicKey, price, signature } = req.body as BuyRequestBody;
    
    // Validate parameters
    if (!memoryMint || !buyerPublicKey || !price) {
      return res.status(400).json({ error: '缺少必要的参数' });
    }
    
    // Parse public key
    let memoryPublicKey: PublicKey;
    let buyer: PublicKey;
    
    try {
      memoryPublicKey = new PublicKey(memoryMint);
      buyer = new PublicKey(buyerPublicKey);
    } catch (error) {
      return res.status(400).json({ error: '无效的公钥格式' });
    }
    
    // Initialize service
    const mintService = new MintService();
    
    // Get memory information
    const memoryData = await mintService.getMemoryData(memoryPublicKey);
    
    if (!memoryData) {
      return res.status(404).json({ error: '记忆不存在' });
    }
    
    // Check if memory is transferable
    if (!memoryData.transferable) {
      return res.status(400).json({
        success: false,
        message: '该记忆NFT不可转让'
      });
    }
    
    // Check if memory is for sale
    // This should query the Marketplace contract to confirm if the memory is already listed for sale
    // TODO: 实现Marketplace合约查询
    const isForSale = true; // [Chinese comment] 假设在售
    const listedPrice = price; // [Chinese comment] 假设上架价格与购买价格一致
    
    if (!isForSale) {
      return res.status(400).json({
        success: false,
        message: '该记忆NFT未上架销售'
      });
    }
    
    // Check if price matches
    if (listedPrice !== price) {
      return res.status(400).json({
        success: false,
        message: '购买价格与上架价格不匹配'
      });
    }
    
    // Get seller information
    const seller = memoryData.owner;
    
    // Execute transaction
    // If signature is provided, verify and submit
    // Otherwise, server builds transaction and sends
    let transactionSignature: string;
    
    if (signature) {
      // Client signing mode
      // Verify signature and submit
      transactionSignature = signature;
      
      // TODO: 实现签名Validate和submitted
      // The actual implementation would call the blockchain module to submit the transaction
    } else {
      // Server signing mode
      // Build and sign transaction
      
      // Simulate transaction process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // [Chinese comment] 这里只是模拟，实际项目中应该调用MintService中的transferMemory方法
      transactionSignature = 'simulated_transaction_signature_' + Date.now();
    }
    
    // Get memory metadata
    const metadata = await getMemoryMetadataFromIPFS(memoryData.uri);
    
    // Return success response
    return res.status(200).json({
      success: true,
      transactionSignature,
      message: '购买成功',
      memory: {
        mint: memoryMint,
        name: metadata.name,
        imageUrl: metadata.image,
        price,
        seller: seller.toString(),
        buyer: buyer.toString()
      }
    });
  } catch (error) {
    console.error('处理购买请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
} 