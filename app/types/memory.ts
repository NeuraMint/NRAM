/**
 * Represents a memory NFT in the NeuraMint platform
 */
export interface Memory {
  id: string;
  mint: string;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
  price?: number;
  isListed: boolean;
  quality: 1 | 2 | 3 | 4; // 1: Common, 2: Fine, 3: Excellent, 4: Legendary
  memoryType: string; // cognitive, emotional, cultural, therapeutic
  createdAt: number;
  neuralFingerprint: string;
  brainRegion?: string;
  emotionalValence?: number;
  cognitiveLoad?: number;
  uri: string;
}

/**
 * Represents a memory listing in the marketplace
 */
export interface MemoryListing {
  id: string;
  mint: string;
  seller: string;
  price: number;
  listedAt: number;
  memory: Memory;
  isAuction: boolean;
  auctionEndTime?: number;
  minimumBid?: number;
  highestBid?: number;
  highestBidder?: string;
}

/**
 * Represents a bid on an auction memory
 */
export interface MemoryBid {
  id: string;
  listingId: string;
  bidder: string;
  amount: number;
  timestamp: number;
}

/**
 * Represents a collection of memories
 */
export interface MemoryCollection {
  id: string;
  owner: string;
  name: string;
  description: string;
  coverImageUrl: string;
  memoryIds: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Represents a memory transaction (sale, transfer)
 */
export interface MemoryTransaction {
  id: string;
  memoryId: string;
  from: string;
  to: string;
  price?: number;
  transactionType: 'sale' | 'transfer' | 'mint';
  timestamp: number;
  signature: string;
}

/**
 * Memory quality tiers
 */
export enum MemoryQuality {
  Common = 1,
  Fine = 2,
  Excellent = 3,
  Legendary = 4
}

/**
 * Memory types
 */
export enum MemoryType {
  Cognitive = 'cognitive',
  Emotional = 'emotional',
  Cultural = 'cultural',
  Therapeutic = 'therapeutic'
} 