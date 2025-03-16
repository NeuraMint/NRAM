import { NextApiRequest, NextApiResponse } from 'next';
import { PublicKey } from '@solana/web3.js';
import { MintService } from '../../../services/mintService';
import { getMemoryMetadataFromIPFS } from '../../../utils/ipfsUtils';

// Request body interface
interface ListRequestBody {
  memoryMint: string;       // Memory NFT mint address
  sellerPublicKey: string;  // Seller wallet address
  price: number;            // Listing price
  signature?: string;       // Signed transaction signature (optional, for client signing mode)
}

// Response interface
interface ListResponseData {
  success: boolean;
  transactionSignature?: string;
  message?: string;
  listing?: {
    mint: string;
    name: string;
    imageUrl: string;
    price: number;
    seller: string;
    listingId: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListResponseData | { error: string }>[Chinese UI text] 
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    // Parse request body
    const { memoryMint, sellerPublicKey, price, signature } = req.body as ListRequestBody;
    
    // Validate parameters
    if (!memoryMint || !sellerPublicKey || !price) {
      return res.status(400).json({ error: '缺少必要的参数' });
    }
    
    // Validate price
    if (price <= 0) {
      return res.status(400).json({ error: '价格必须大于0' });
    }
    
    // Parse public key
    let memoryPublicKey: PublicKey;
    let seller: PublicKey;
    
    try {
      memoryPublicKey = new PublicKey(memoryMint);
      seller = new PublicKey(sellerPublicKey);
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
    
    // Verify ownership
    if (!memoryData.owner.equals(seller)) {
      return res.status(403).json({
        success: false,
        message: '只有拥有者才能上架记忆NFT'
      });
    }
    
    // Check if memory is transferable
    if (!memoryData.transferable) {
      return res.status(400).json({
        success: false,
        message: '该记忆NFT不可转让，无法上架销售'
      });
    }
    
    // Check if memory is already listed
    // This should query the Marketplace contract to confirm if the memory is already listed for sale
    // TODO: 实现Marketplace合约查询
    const isAlreadyListed = false; // [Chinese comment] 假设未上架
    
    if (isAlreadyListed) {
      return res.status(400).json({
        success: false,
        message: '该记忆NFT已经上架销售'
      });
    }
    
    // Execute listing transaction
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
      
      // This is just a simulation, an actual project should call the listing method of the Marketplace contract
      transactionSignature = 'simulated_transaction_signature_' + Date.now();
    }
    
    // Get memory metadata
    const metadata = await getMemoryMetadataFromIPFS(memoryData.uri);
    
    // Generate virtual listing ID
    const listingId = `listing_${memoryMint}_${Date.now()}`;
    
    // Return success response
    return res.status(200).json({
      success: true,
      transactionSignature,
      message: '上架成功',
      listing: {
        mint: memoryMint,
        name: metadata.name,
        imageUrl: metadata.image,
        price,
        seller: seller.toString(),
        listingId
      }
    });
  } catch (error) {
    console.error('处理上架请求时出错:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
} 