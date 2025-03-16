import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { ApiService } from '../../services/apiService';
import { MintService } from '../../services/mintService';
import { formatSol, getExplorerUrl } from '../../utils/environment';
import { MemoryType, MemoryQuality } from '../../hooks/useMemoryMarket';

// [Chinese comment] 内存类型颜色映射
const MEMORY_TYPE_COLORS: Record<string, string>[Chinese UI text]  = {
  visual: 'bg-purple-500 text-white',
  conceptual: 'bg-blue-500 text-white',
  emotional: 'bg-pink-500 text-white',
  procedural: 'bg-green-500 text-white',
  episodic: 'bg-yellow-500 text-black',
  spatial: 'bg-orange-500 text-white'
};

// [Chinese comment] 内存品质颜色映射
const MEMORY_QUALITY_COLORS: Record<string, string> = {
  common: 'bg-gray-400 text-white',
  uncommon: 'bg-green-400 text-black',
  rare: 'bg-blue-400 text-white',
  epic: 'bg-purple-500 text-white',
  legendary: 'bg-yellow-400 text-black'
};

const MemoryDetails: NextPage = () =>[Chinese UI text]  {
  const router = useRouter();
  const { id } = router.query;
  const wallet = useWallet();

  // [Chinese comment] 状态
  const [memoryData, setMemoryData] = useState<any>(null);
  const [validations, setValidations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [listingPrice, setListingPrice] = useState<string>('');
  const [isListingMode, setIsListingMode] = useState(false);

  const apiService = new ApiService();
  
  // [Chinese comment] 获取内存数据
  useEffect(() => {
    const fetchMemoryData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // [Chinese comment] 获取内存数据
        const memory = await apiService.getMemoryById(id as string);
        setMemoryData(memory);
        
        // [Chinese comment] 获取Validate记录
        const validationRecords = await apiService.getValidatorHistory(memory.mintAddress);
        setValidations(validationRecords);
      } catch (err) {
        console.error('获取内存数据失败:', err);
        setError('无法加载内存数据，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemoryData();
  }, [id, apiService]);
  
  // [Chinese comment] 处理购买内存
  const handleBuyMemory = async () => {
    if (!wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!memoryData || !memoryData.isListed || !memoryData.price) {
      toast.error('[Chinese UI text] 该内存当前不可购买');
      return;
    }

    setProcessing(true);
    try {
      const mintService = new MintService(wallet);
      const toastId = toast.loading('正在购买内存...');
      
      await mintService.transferMemory(
        new PublicKey(memoryData.mintAddress),
        new PublicKey(memoryData.owner), 
        wallet.publicKey!
      );
      
      toast.success('[Chinese UI text] 内存购买成功！', { id: toastId });
      
      // [Chinese comment] 更新内存数据以反映新的所有权
      const updatedMemory = { 
        ...memoryData, 
        owner: wallet.publicKey!.toString(),
        isListed: false,
        price: null
      };
      setMemoryData(updatedMemory);
    } catch (error) {
      console.error('购买失败:', error);
      toast.error(`购买失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };
  
  // [Chinese comment] 处理上架出售
  const handleListMemory = async () =>[Chinese UI text]  {
    if (!wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!memoryData || memoryData.owner !== wallet.publicKey?.toString()) {
      toast.error('[Chinese UI text] 您不是此内存的拥有者');
      return;
    }
    
    const price = parseFloat(listingPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('[Chinese UI text] 请输入有效的价格');
      return;
    }
    
    setProcessing(true);
    try {
      // [Chinese comment] 这里应调用实际的上架API，模拟上架成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('[Chinese UI text] 内存已成功上架出售');
      
      // [Chinese comment] 更新内存数据以反映上架状态
      const updatedMemory = { 
        ...memoryData, 
        isListed: true,
        price
      };
      setMemoryData(updatedMemory);
      setIsListingMode(false);
    } catch (error) {
      console.error('上架失败:', error);
      toast.error(`上架失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };
  
  // [Chinese comment] 处理下架
  const handleDelistMemory = async () => {
    if (!wallet.connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!memoryData || !memoryData.isListed || memoryData.owner !== wallet.publicKey?.toString()) {
      toast.error('[Chinese UI text] 您不能下架此内存');
      return;
    }
    
    setProcessing(true);
    try {
      // [Chinese comment] 这里应调用实际的下架API，模拟下架成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('[Chinese UI text] 内存已成功下架');
      
      // [Chinese comment] 更新内存数据以反映下架状态
      const updatedMemory = { 
        ...memoryData, 
        isListed: false,
        price: null
      };
      setMemoryData(updatedMemory);
    } catch (error) {
      console.error('下架失败:', error);
      toast.error(`下架失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // [Chinese comment] 截断地址
  const truncateAddress = (address: string) =>[Chinese UI text]  {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };
  
  // [Chinese comment] 渲染加载状态
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>[Chinese UI text] 
    );
  }
  
  // [Chinese comment] 渲染错误状态
  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">[Chinese UI text] 加载失败</h1>
        <p className="mb-6">{error}</p>
        <button 
          onClick={() => router.back()} 
          className="btn btn-primary"
        >[Chinese UI text] 
          返回
        </button>
      </div>[Chinese UI text] 
    );
  }
  
  // [Chinese comment] 渲染内存不存在状态
  if (!memoryData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">[Chinese UI text] 内存不存在</h1>
        <p className="mb-6">[Chinese UI text] 找不到ID为 {id} 的内存</p>
        <Link href="/market">
          <a className="btn btn-primary">[Chinese UI text] 
            返回Marketplace
          </a>
        </Link>
      </div>[Chinese UI text] 
    );
  }
  
  // [Chinese comment] 渲染内存详情
  return (
    <>
      <Head>
        <title>{memoryData.name} | NeuraMint</title>
        <meta name="description" content={memoryData.description} />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/market">
            <a className="text-blue-600 hover:text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>[Chinese UI text] 
              返回Marketplace
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 内存图片和详情 */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full aspect-video">
                {memoryData.imageUrl ? (
                  <Image 
                    src={memoryData.imageUrl} 
                    alt={memoryData.name} 
                    layout="fill" 
                    objectFit="cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">[Chinese UI text] 无图片</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold">{memoryData.name}</h1>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm ${MEMORY_TYPE_COLORS[memoryData.type]}`}>
                      {memoryData.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${MEMORY_QUALITY_COLORS[memoryData.quality]}`}>
                      {memoryData.quality}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">{memoryData.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500">[Chinese UI text] 创建者</span>
                    <p className="text-sm font-mono">
                      <a 
                        href={getExplorerUrl(memoryData.creator)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {truncateAddress(memoryData.creator)}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">[Chinese UI text] 拥有者</span>
                    <p className="text-sm font-mono">
                      <a 
                        href={getExplorerUrl(memoryData.owner)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {truncateAddress(memoryData.owner)}
                        {wallet.connected && memoryData.owner === wallet.publicKey?.toString() && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">[Chinese UI text] 
                            您
                          </span>
                        )}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">[Chinese UI text] 创建时间</span>
                    <p className="text-sm">{formatDate(memoryData.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">[Chinese UI text] Mint地址</span>
                    <p className="text-sm font-mono">
                      <a 
                        href={getExplorerUrl(memoryData.mintAddress, 'token')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {truncateAddress(memoryData.mintAddress)}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">[Chinese UI text] 可转让</span>
                    <p className="text-sm">
                      {memoryData.isTransferable ? (
                        <span className="text-green-600">[Chinese UI text] 是</span>
                      ) : (
                        <span className="text-red-600">[Chinese UI text] 否</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">[Chinese UI text] 强度</span>
                    <p className="text-sm">{memoryData.intensity}/10</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">[Chinese UI text] 神经指纹</h3>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-xs font-mono break-all">{memoryData.neuralFingerprint}</p>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div>
                  {!wallet.connected ? (
                    <div className="text-center p-4 bg-gray-50 rounded-lg mb-4">
                      <p className="mb-2">[Chinese UI text] 连接钱包以购买或管理此内存</p>
                      <WalletMultiButton />
                    </div>[Chinese UI text] 
                  ) : memoryData.owner === wallet.publicKey?.toString() ? (
                    // [Chinese comment] 拥有者操作
                    <>
                      {isListingMode ? (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h3 className="text-lg font-semibold mb-2">[Chinese UI text] 上架出售</h3>
                          <div className="flex items-center mb-4">
                            <input
                              type="number"
                              value={listingPrice}
                              onChange={(e) => setListingPrice(e.target.value)}
                              placeholder="输入价格 (SOL)"
                              min="0"
                              step="0.01"
                              className="input mr-2"
                            />
                            <span>SOL</span>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={handleListMemory}
                              disabled={processing}
                              className="btn btn-primary"
                            >
                              {processing ? '处理中...' : '确认上架'}
                            </button>
                            <button
                              onClick={() => setIsListingMode(false)}
                              disabled={processing}
                              className="btn btn-secondary"
                            >[Chinese UI text] 
                              取消
                            </button>
                          </div>
                        </div>
                      ) : memoryData.isListed ? (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <h3 className="text-lg font-semibold">[Chinese UI text] 当前上架价格</h3>
                              <p className="text-2xl font-bold text-blue-600">{formatSol(memoryData.price)} SOL</p>
                            </div>
                            <button
                              onClick={handleDelistMemory}
                              disabled={processing}
                              className="btn btn-secondary"
                            >
                              {processing ? '处理中...' : '下架'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsListingMode(true)}
                          className="btn btn-primary w-full mb-4"
                        >[Chinese UI text] 
                          上架出售
                        </button>
                      )}
                      
                      <Link href="/validator-dashboard">
                        <a className="btn btn-secondary w-full">[Chinese UI text] 
                          管理我的内存
                        </a>
                      </Link>
                    </>[Chinese UI text] 
                  ) : (
                    // [Chinese comment] 非拥有者操作
                    <>
                      {memoryData.isListed && memoryData.price ? (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <h3 className="text-lg font-semibold">[Chinese UI text] 售价</h3>
                              <p className="text-2xl font-bold text-blue-600">{formatSol(memoryData.price)} SOL</p>
                            </div>
                            <button
                              onClick={handleBuyMemory}
                              disabled={processing}
                              className="btn btn-primary"
                            >
                              {processing ? '处理中...' : '购买'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
                          <p className="text-lg">[Chinese UI text] 此内存当前未上架出售</p>
                        </div>
                      )}
                      
                      <Link href="/market">
                        <a className="btn btn-secondary w-full">[Chinese UI text] 
                          浏览更多内存
                        </a>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Validate记录 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">[Chinese UI text] Validate记录</h2>
              
              {validations.length === 0 ? (
                <p className="text-gray-500 text-center py-6">[Chinese UI text] 暂无Validate记录</p>
              ) : (
                <div className="space-y-4">
                  {validations.map((validation, index) => (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">[Chinese UI text] 
                          Validate者: 
                          <a 
                            href={getExplorerUrl(validation.validator)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-600 hover:text-blue-800 font-mono"
                          >
                            {truncateAddress(validation.validator)}
                          </a>
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(validation.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium mr-2">[Chinese UI text] 得分:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              validation.score >= 70 ? 'bg-green-500' : 
                              validation.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${validation.score}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{validation.score}</span>
                      </div>
                      
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium mr-2">[Chinese UI text] 有效性:</span>
                        <span className={`text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                          {validation.isValid ? '有效' : '无效'}
                        </span>
                      </div>
                      
                      {validation.comment && (
                        <div className="mt-2">
                          <span className="text-sm font-medium">[Chinese UI text] 评论:</span>
                          <p className="text-sm text-gray-700 mt-1">{validation.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <Link href="/submit-validation/[id]" as={`/submit-validation/${id}`}>
                  <a className="btn btn-secondary w-full">
                    Submit validation
                  </a>
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">[Chinese UI text] 类似内存</h2>
              
              <p className="text-gray-500 text-center py-4">[Chinese UI text] 
                推荐功能正在开发中...
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MemoryDetails; 