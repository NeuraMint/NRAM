import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatSol } from '../utils/environment';
import { MemoryType, MemoryQuality } from '../hooks/useMemoryMarket';

// Colors corresponding to memory types
const MEMORY_TYPE_COLORS: Record<MemoryType, string>  = {
  visual: 'bg-purple-500',
  conceptual: 'bg-blue-500',
  emotional: 'bg-pink-500',
  procedural: 'bg-green-500',
  episodic: 'bg-yellow-500',
  spatial: 'bg-orange-500'
};

// Colors corresponding to memory quality
const MEMORY_QUALITY_COLORS: Record<MemoryQuality, string> = {
  common: 'bg-gray-400',
  uncommon: 'bg-green-400',
  rare: 'bg-blue-400',
  epic: 'bg-purple-500',
  legendary: 'bg-yellow-400'
};

// Memory card component properties
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
  
  // Handle card flip
  const handleFlip = (e: React.MouseEvent) => {
    // Prevent bubbling to avoid triggering flip when clicking buttons or links
    if ((e.target as HTMLElement).tagName !== 'BUTTON' && 
        !(e.target as HTMLElement).closest('a')) {
      setIsFlipped(!isFlipped);
    }
  };
  
  // Handle buy button click
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
  
  // Limit description length
  const shortenDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Truncate address
  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="perspective-1000 w-full h-[360px] cursor-pointer group" title="Click to flip card for details">
      <motion.div 
        className={`relative w-full h-full preserve-3d transition-all duration-500 ${isFlipped ? 'rotateY-180' : ''}`}
        whileHover={{ scale: 1.02 }}
        onClick={handleFlip}
      >
        {/* Front of card */}
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
                <span className="text-gray-400">No Image</span>
              </div> 
            )}
            
            {/* Type and quality labels */}
            <div className="absolute top-2 left-2 flex space-x-2">
              <span className={`px-2 py-1 rounded-md text-xs text-white ${MEMORY_TYPE_COLORS[memoryType]}`}>
                {memoryType}
              </span>
              <span className={`px-2 py-1 rounded-md text-xs text-white ${MEMORY_QUALITY_COLORS[quality]}`}>
                {quality}
              </span>
            </div> 
            
            {/* Owner label */}
            {isOwner && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-blue-600 rounded-md text-xs text-white"> 
                  You Own
                </span>
              </div> 
            )}
            
            {/* Price label */}
            {price !== null && (
              <div className="absolute bottom-2 right-2">
                <span className="px-2 py-1 bg-black bg-opacity-70 rounded-md text-sm text-white">
                  {formatSol(price)} SOL
                </span>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white rounded-b-lg shadow-lg h-2/5 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1 truncate" title={name}>{name}</h3>
              <p className="text-sm text-gray-600 mb-2" title={description}>
                {shortenDescription(description)}
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <Link href={`/memory/${id}`} className="text-blue-600 hover:underline text-sm">
                View Details
              </Link>
              
              <div className="text-xs text-gray-500">
                Owner: {shortenAddress(owner)}
              </div>
            </div>
            
            {price !== null && !isOwner && (
              <button
                className={`mt-2 w-full py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition 
                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleBuy}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Buy Now'}
              </button>
            )}
          </div>
        </div>
        
        {/* Back of card */}
        <div className="card absolute w-full h-full backface-hidden rotateY-180 bg-white rounded-lg shadow-lg p-5 overflow-y-auto">
          <h3 className="font-semibold text-xl mb-3">{name}</h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Neural Fingerprint</h4>
            <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{neuralFingerprint}</p>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Properties</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs">
                <span className="text-gray-500">Memory Type:</span> 
                <span className="ml-1">{memoryType}</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Quality:</span> 
                <span className="ml-1">{quality}</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Owner:</span> 
                <span className="ml-1">{shortenAddress(owner)}</span>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Mint:</span> 
                <span className="ml-1">{shortenAddress(mint)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Link href={`/memory/${id}`} className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition">
              Full Details
            </Link>
            
            {isOwner && price === null && (
              <button 
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition"
                onClick={() => {/* Implement list for sale logic */}}
              >
                List for Sale
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 