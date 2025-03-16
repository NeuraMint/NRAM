import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  ConfirmOptions
} from '@solana/web3.js';
import { 
  Program, 
  AnchorProvider,
  web3
} from '@project-serum/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token';

// [Chinese comment] 合约的程序ID
export const MEMORY_NFT_PROGRAM_ID = new PublicKey('YOUR_MEMORY_NFT_PROGRAM_ID');
export const MEMORY_VALIDATOR_PROGRAM_ID = new PublicKey('YOUR_MEMORY_VALIDATOR_PROGRAM_ID');
export const NRAM_TOKEN_MINT = new PublicKey('YOUR_NRAM_TOKEN_MINT'); // [Chinese comment] 平台代币铸币地址

// [Chinese comment] 连接Solana网络并获取程序实例
export const getConnection = (endpoint: string = 'https://api.devnet.solana.com') => {
  return new Connection(endpoint, 'confirmed');
};

export const getProvider = (connection: Connection, wallet: any) =>[Chinese UI text]  {
  if (!wallet.publicKey) throw new Error('Wallet not connected');
  
  return new AnchorProvider(
    connection,
    wallet as any,
    { commitment: 'confirmed' }
  );
};

// [Chinese comment] 查询账户SOL余额
export const getSolBalance = async (connection: Connection, publicKey: PublicKey): Promise<number> =>[Chinese UI text]  {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
};

// [Chinese comment] 查询账户SPL代币余额
export const getTokenBalance = async (
  connection: Connection, 
  walletAddress: PublicKey, 
  mintAddress: PublicKey
): Promise<number> =>[Chinese UI text]  {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      walletAddress
    );
    
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return Number(balance.value.amount) / Math.pow(10, balance.value.decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
};

// [Chinese comment] 生成关联代币账户
export const createAssociatedTokenAccount = async (
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey
): Promise<TransactionInstruction> =>[Chinese UI text]  {
  const associatedToken = await getAssociatedTokenAddress(
    mint,
    owner
  );
  
  // [Chinese comment] 检查账户是否已经存在
  const accountInfo = await connection.getAccountInfo(associatedToken);
  if (accountInfo !== null) {
    console.log('Token account already exists');
    return null;
  }
  
  return createAssociatedTokenAccountInstruction(
    payer,
    associatedToken,
    owner,
    mint
  );
};

// [Chinese comment] 获取记忆数据账户PDA
export const getMemoryDataPDA = async (
  memoryId: string,
  programId: PublicKey = MEMORY_NFT_PROGRAM_ID
): Promise<[PublicKey, number]> =>[Chinese UI text]  {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('memory'),
      Buffer.from(memoryId)
    ],
    programId
  );
};

// [Chinese comment] 获取Validate者账户PDA
export const getValidatorPDA = async (
  validatorAddress: PublicKey,
  programId: PublicKey = MEMORY_VALIDATOR_PROGRAM_ID
): Promise<[PublicKey, number]> =>[Chinese UI text]  {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('validator'),
      validatorAddress.toBuffer()
    ],
    programId
  );
};

// [Chinese comment] 获取Validate配置账户PDA
export const getValidatorConfigPDA = async (
  programId: PublicKey = MEMORY_VALIDATOR_PROGRAM_ID
): Promise<[PublicKey, number]> =>[Chinese UI text]  {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from('validator-config')
    ],
    programId
  );
};

// [Chinese comment] Mint记忆NFT
export const mintMemoryNFT = async (
  connection: Connection,
  wallet: any,
  memoryData: {
    uri: string,
    name: string,
    symbol: string,
    memoryType: string,
    quality: string,
    neuralFingerprint: string,
    brainRegion: string,
    timestamp: number
  }
): Promise<string> =>[Chinese UI text]  {
  try {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    
    // [Chinese comment] 生成随机记忆ID
    const memoryId = Math.random().toString(36).substring(2, 15);
    
    // [Chinese comment] 获取记忆PDA
    const [memoryPDA, memoryBump] = await getMemoryDataPDA(memoryId);
    
    // [Chinese comment] 创建铸币账户
    const mintKeypair = web3.Keypair.generate();
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      lamports: mintRent,
      space: 82,
      programId: TOKEN_PROGRAM_ID
    });
    
    // [Chinese comment] 创建用户关联代币账户
    const associatedTokenAccountIx = await createAssociatedTokenAccount(
      connection,
      wallet.publicKey,
      mintKeypair.publicKey,
      wallet.publicKey
    );
    
    // [Chinese comment] 构建交易
    const transaction = new Transaction();
    
    if (createMintAccountIx) transaction.add(createMintAccountIx);
    if (associatedTokenAccountIx) transaction.add(associatedTokenAccountIx);
    
    // [Chinese comment] 这里应添加实际的调用合约指令，这需要导入生成的合约类型
    // [Chinese comment] 这是一个示例，实际实现需要合约IDL
    /*
    const mintIx = program.instruction.mintMemory(
      memoryBump,
      memoryId,
      memoryData.uri,
      memoryData.name,
      memoryData.symbol,
      memoryData.memoryType,
      memoryData.quality,
      memoryData.neuralFingerprint,
      memoryData.brainRegion,
      new BN(memoryData.timestamp),
      {
        accounts: {
          mint: mintKeypair.publicKey,
          memoryData: memoryPDA,
          authority: wallet.publicKey,
          tokenAccount: associatedTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        }
      }
    );
    transaction.add(mintIx);
    */
    
    // [Chinese comment] 签名并发送交易
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    const signedTx = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction(txid);
    return memoryId;
  } catch (error) {
    console.error('Error minting memory NFT:', error);
    throw error;
  }
};

// Register as a validator
export const registerValidator = async (
  connection: Connection,
  wallet: any,
  stakeAmount: number // [Chinese comment] 代币数量
): Promise<boolean> =>[Chinese UI text]  {
  try {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    
    // [Chinese comment] 获取Validate者PDA
    const [validatorPDA, validatorBump] = await getValidatorPDA(wallet.publicKey);
    
    // [Chinese comment] 获取用户NRAM代币账户
    const userTokenAccount = await getAssociatedTokenAddress(
      NRAM_TOKEN_MINT,
      wallet.publicKey
    );
    
    // [Chinese comment] 构建交易
    const transaction = new Transaction();
    
    // [Chinese comment] 这里应添加实际的调用合约指令，这需要导入生成的合约类型
    // [Chinese comment] 这是一个示例，实际实现需要合约IDL
    /*
    const registerIx = program.instruction.registerValidator(
      validatorBump,
      new BN(stakeAmount * Math.pow(10, 9)), // [Chinese comment] 假设9位小数
      {
        accounts: {
          validator: validatorPDA,
          authority: wallet.publicKey,
          tokenAccount: userTokenAccount,
          tokenMint: NRAM_TOKEN_MINT,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        }
      }
    );
    transaction.add(registerIx);
    */
    
    // [Chinese comment] 签名并发送交易
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    const signedTx = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction(txid);
    return true;
  } catch (error) {
    console.error('Error registering validator:', error);
    throw error;
  }
};

// Submit validation results
export const submitValidation = async (
  connection: Connection,
  wallet: any,
  memoryId: string,
  score: number,
  comments: string
): Promise<boolean> =>[Chinese UI text]  {
  try {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    
    // [Chinese comment] 获取Validate者PDA
    const [validatorPDA, validatorBump] = await getValidatorPDA(wallet.publicKey);
    
    // [Chinese comment] 获取记忆PDA
    const [memoryPDA, memoryBump] = await getMemoryDataPDA(memoryId);
    
    // [Chinese comment] 生成随机ValidateID
    const validationId = Math.random().toString(36).substring(2, 15);
    
    // [Chinese comment] 构建交易
    const transaction = new Transaction();
    
    // [Chinese comment] 这里应添加实际的调用合约指令，这需要导入生成的合约类型
    // [Chinese comment] 这是一个示例，实际实现需要合约IDL
    /*
    const submitIx = program.instruction.submitValidation(
      validationId,
      new BN(score),
      comments,
      {
        accounts: {
          validator: validatorPDA,
          memory: memoryPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId
        }
      }
    );
    transaction.add(submitIx);
    */
    
    // [Chinese comment] 签名并发送交易
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    const signedTx = await wallet.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTx.serialize());
    
    await connection.confirmTransaction(txid);
    return true;
  } catch (error) {
    console.error('Error submitting validation:', error);
    throw error;
  }
};

// [Chinese comment] 获取用户的记忆NFT列表
export const getUserMemories = async (
  connection: Connection,
  userAddress: PublicKey
): Promise<any[]> => {
  try {
    // [Chinese comment] 查询用户拥有的代币账户
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userAddress,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    // [Chinese comment] 过滤出数量为1的账户（可能是NFT）
    const nftAccounts = tokenAccounts.value.filter(
      ta => {
        const amount = (ta.account.data as ParsedAccountData).parsed.info.tokenAmount;
        return amount.uiAmount === 1 && amount.decimals === 0;
      }
    );
    
    // [Chinese comment] 这里应该查询链上数据来确认这些是记忆NFT
    // [Chinese comment] 然后获取它们的元数据
    // [Chinese comment] 这是一个简化版
    const memories = nftAccounts.map(account =>[Chinese UI text]  {
      const mintAddress = (account.account.data as ParsedAccountData).parsed.info.mint;
      return {
        mint: mintAddress,
        // [Chinese comment] 其他属性需要从链上或元数据服务获取
      };
    });
    
    return memories;
  } catch (error) {
    console.error('Error getting user memories:', error);
    return [];
  }
};

// [Chinese comment] 获取Marketplace上的记忆NFT列表
export const getMarketplaceMemories = async (
  connection: Connection
): Promise<any[]> =>[Chinese UI text]  {
  try {
    // [Chinese comment] 这里应该查询链上Marketplace数据
    // [Chinese comment] 这是一个示例，实际实现需要合约IDL
    
    // [Chinese comment] 模拟数据
    return [
      {
        id: '1',
        title: 'Creative Breakthrough',
        price: 2500,
        // [Chinese comment] 其他属性
      },
      {
        id: '2',
        title: 'Serene Meditation',
        price: 5000,
        // [Chinese comment] 其他属性
      }
    ];
  } catch (error) {
    console.error('Error getting marketplace memories:', error);
    return [];
  }
};

// [Chinese comment] 获取待Validate的记忆列表
export const getMemoriesToValidate = async (
  connection: Connection
): Promise<any[]> =>[Chinese UI text]  {
  try {
    // [Chinese comment] 这里应该查询链上Validate数据
    // [Chinese comment] 这是一个示例，实际实现需要合约IDL
    
    // [Chinese comment] 模拟数据
    return [
      {
        id: '101',
        title: 'Childhood Park Memory',
        // [Chinese comment] 其他属性
      },
      {
        id: '102',
        title: 'Complex Problem Solving',
        // [Chinese comment] 其他属性
      }
    ];
  } catch (error) {
    console.error('Error getting memories to validate:', error);
    return [];
  }
};

// [Chinese comment] 获取Validate者信息
export const getValidatorInfo = async (
  connection: Connection,
  validatorAddress: PublicKey
): Promise<any> =>[Chinese UI text]  {
  try {
    // [Chinese comment] 获取Validate者PDA
    const [validatorPDA, validatorBump] = await getValidatorPDA(validatorAddress);
    
    // [Chinese comment] 获取账户信息
    const accountInfo = await connection.getAccountInfo(validatorPDA);
    
    if (!accountInfo) {
      return null; // [Chinese comment] Validate者不存在
    }
    
    // [Chinese comment] 这里应该解析账户数据
    // [Chinese comment] 这是一个示例，实际实现需要合约IDL
    
    return {
      address: validatorAddress.toString(),
      stake: 1000,
      validationsCompleted: 10,
      successRate: 95,
      earnings: 50
    };
  } catch (error) {
    console.error('Error getting validator info:', error);
    return null;
  }
};

// Default commitment level for transactions
export const DEFAULT_COMMITMENT = 'confirmed';

/**
 * Claim validation rewards for a validator
 * @param connection - Solana connection
 * @param wallet - Wallet object (simplified for mock implementation)
 * @param options - Transaction confirmation options
 * @returns Transaction signature or null
 */
export async function claimValidationRewards(
  connection: Connection,
  wallet: { publicKey: PublicKey },
  options?: ConfirmOptions
): Promise<string | null> {
  try {
    if (!wallet.publicKey) return null;
    
    // TODO: In production, implement actual blockchain interaction
    // This is a mock implementation that simulates a successful transaction
    
    console.log('Claiming validation rewards for:', wallet.publicKey.toString());
    
    // In development, simulate successful transaction
    if (process.env.NODE_ENV !== 'production') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return '5wBYqXSMTdJWrJMUfbYCFd6KjYb8oUHJQnZ82TQcjT2ar5rQwjxnYFcAWnGpJ5vA3XFTfM7PNS8Aw1UJvuRHyRKJ';
    }
    
    // In production, this would be the actual transaction submission code
    return null;
  } catch (error) {
    console.error('Error claiming validation rewards:', error);
    return null;
  }
} 