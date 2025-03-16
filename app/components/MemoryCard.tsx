import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatSol } from '../utils/environment';
import { MemoryType, MemoryQuality } from '../hooks/useMemoryMarket';

// [Chinese comment] 内存类型对应的颜色
const MEMORY_TYPE_COLORS: Record<MemoryType, string>[Chinese UI text]  = {
  visual: 'bg-purple-500',
  conceptual: 'bg-blue-500',
  emotional: 'bg-pink-500',
  procedural: 'bg-green-500',
  episodic: 'bg-yellow-500',
  spatial: 'bg-orange-500'
};

// [Chinese comment] 内存品质对应的颜色
const MEMORY_QUALITY_COLORS: Record<MemoryQuality, string> = {
  common: 'bg-gray-400',
  uncommon: 'bg-green-400',
  rare: 'bg-blue-400',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-400'
};

// [Chinese comment] 内存卡片组件属性
export interface MemoryCardProps {
  id: string;
  name: string;
  description: string;
  memoryType: MemoryType;
  quality: MemoryQuality;
  imageUrl: string;
  neuralFingerprint: string;
  price: number | null;
  owner: string;
  mint: string;
  isOwner: boolean;
  onBuy?: (mint: string) => Promise<void>;
  onSell?: (mint: string, price: number) => Promise<void>;
}

export default function MemoryCard({
  id,
  name,
  description,
  memoryType,
  quality,
  imageUrl,
  neuralFingerprint,
  price,
  owner,
  mint,
  isOwner,
  onBuy,
  onSell
}: MemoryCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // [Chinese comment] 处理卡片翻转
  const handleFlip = (e: React.MouseEvent) => {
    // 阻止冒泡，以防点击Links或按钮时触发翻转
    if ((e.target as HTMLElement).tagName !== 'BUTTON' && 
        !(e.target as HTMLElement).closest('a')) {
      setIsFlipped(!isFlipped);
    }
  };
  
  // [Chinese comment] 处理购买按钮点击
  const handleBuy = async () => {
    if (onBuy) {
      setIsLoading(true);
      try {
        await onBuy(mint);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // [Chinese comment] 限制描述长度
  const shortenDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // [Chinese comment] 截断地址
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="perspective-1000 w-full h-[360px] cursor-pointer group" title="点击翻转卡片查看详情">
      <motion.div 
        className={`relative w-full h-full preserve-3d transition-all duration-500 ${isFlipped ? 'rotateY-180' : ''}`}
        whileHover={{ scale: 1.02 }}
        onClick={handleFlip}
      >
        {/* 卡片正面 */}
        <div className="card absolute w-full h-full backface-hidden">
          <div className="relative w-full h-3/5">
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={name} 
                layout="fill" 
                objectFit="cover" 
                className="rounded-t-lg"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                <span className="text-gray-400">[Chinese UI text] 无图片</span>
              </div>[Chinese UI text] 
            )}
            
            {/* 类型和品质标签 */}
            <div className="absolute top-2 left-2 flex space-x-2">
              <span className={`px-2 py-1 rounded-md text-xs text-white ${MEMORY_TYPE_COLORS[memoryType]}`}>
                {memoryType}
              </span>
              <span className={`px-2 py-1 rounded-md text-xs text-white ${MEMORY_QUALITY_COLORS[quality]}`}>
                {quality}
              </span>
            </div>[Chinese UI text] 
            
            {/* 拥有者标签 */}
            {isOwner && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-blue-600 rounded-md text-xs text-white">[Chinese UI text] 
                  你拥有
                </span>
              </div>[Chinese UI text] 
            )}
            
            {/* 价格标签 */}
            {price !== null && (
              <div className="absolute bottom-2 right-2">
                <span className="px-2 py-1 bg-black bg-opacity-70 rounded-md text-sm text-white">
                  {formatSol(price)} SOL
                </span>
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="text-lg font-bold line-clamp-1 mb-1">{name}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-2">{shortenDescription(description)}</p>
            
            <div className="flex justify-between items-center mt-auto">
              <div className="text-xs text-gray-500">
                {owner ? `Owner: ${shortenAddress(owner)}` : ''}
              </div>
              
              <Link href={`/memory/${id}`} passHref>
                <a className="text-blue-600 hover:text-blue-800 text-sm font-medium" onClick={e => e.stopPropagation()}>[Chinese UI text] 
                  查看详情
                </a>
              </Link>
            </div>
          </div>
        </div>
        
        {/* 卡片背面 */}
        <div className="card absolute w-full h-full rotateY-180 backface-hidden p-4 flex flex-col">
          <h3 className="text-lg font-bold mb-2">{name}</h3>
          
          <div className="flex-1 overflow-y-auto mb-4">
            <p className="text-gray-700 mb-4">{description}</p>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">[Chinese UI text] 神经指纹:</span>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">{neuralFingerprint}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-500">[Chinese UI text] Mint地址:</span>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded">{mint}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            {price !== null && !isOwner ? (
              <button
                className={`btn btn-primary w-full ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                onClick={handleBuy}
                disabled={isLoading || !onBuy}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>[Chinese UI text] 
                    购买中...
                  </span>[Chinese UI text] 
                ) : (
                  `购买 (${formatSol(price)} SOL)`
                )}
              </button>
            ) : isOwner && price === null && onSell ? (
              <Link href={`/memory/${id}`} passHref>
                <a className="btn btn-secondary w-full text-center" onClick={e => e.stopPropagation()}>[Chinese UI text] 
                  上架出售
                </a>
              </Link>
            ) : isOwner && price !== null ? (
              <Link href={`/memory/${id}`} passHref>
                <a className="btn btn-secondary w-full text-center" onClick={e => e.stopPropagation()}>[Chinese UI text] 
                  管理上架
                </a>
              </Link>
            ) : (
              <Link href={`/memory/${id}`} passHref>
                <a className="btn btn-secondary w-full text-center" onClick={e => e.stopPropagation()}>[Chinese UI text] 
                  查看详情
                </a>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 