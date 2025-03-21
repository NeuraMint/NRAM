import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { toast } from 'react-hot-toast';
import MemoryCard from '../components/MemoryCard';
import { MintService } from '../services/mintService';
import { useMemoryMarket, MemoryType, MemoryQuality, SortOption } from '../hooks/useMemoryMarket';
import { PublicKey } from '@solana/web3.js';

// Memory type options
const MEMORY_TYPES: MemoryType[] = [
  'visual',
  'conceptual',
  'emotional',
  'procedural',
  'episodic',
  'spatial'
];

// Memory quality options
const MEMORY_QUALITIES: MemoryQuality[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
];

// Sort options
const SORT_OPTIONS: {value: SortOption, label: string}[] = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'quality_asc', label: 'Quality: Low to High' },
  { value: 'quality_desc', label: 'Quality: High to Low' },
  { value: 'newest', label: 'Newest Listings' },
  { value: 'oldest', label: 'Oldest Listings' }
];

const Market: NextPage = () => {
  const router = useRouter();
  const wallet = useWallet();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  
  // Use memory MarketplaceHook
  const {
    memories,
    loading,
    error,
    filters,
    sortOption,
    toggleTypeFilter,
    toggleQualityFilter,
    setSearchTerm,
    updateSortOption,
    refreshMemories,
    resetFilters
  } = useMemoryMarket();

  // Handle memory purchase
  const handleBuyMemory = async (mint: string) => {
    if (!wallet.connected) {
      toast.error('Please connect your wallet to purchase memories');
      return;
    }

    try {
      const toastId = toast.loading('Purchasing memory...');
      
      const response = await fetch('/api/market/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          mint,
          buyer: wallet.publicKey!.toString()
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Transaction failed');
      }
      
      toast.success('Memory purchased successfully!', { id: toastId });
      
      // Refetch memories to update the UI
      refreshMemories();
    } catch (error) {
      console.error('Failed to purchase memory:', error);
      toast.error(`Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle price range filtering
  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseFloat(e.target.value);
    const newRange = [...priceRange] as [number, number];
    newRange[index] = newValue;
    setPriceRange(newRange);
  };

  // Apply price filtering
  const applyPriceFilter = () => {
    if (isPriceFilterActive) {
      // If already activated, cancel price filtering
      updateFilter({ minPrice: null, maxPrice: null });
      setIsPriceFilterActive(false);
    } else {
      // Apply price filtering
      updateFilter({ 
        minPrice: priceRange[0] > 0 ? priceRange[0] : null, 
        maxPrice: priceRange[1] < 100 ? priceRange[1] : null 
      });
      setIsPriceFilterActive(true);
    }
  };

  // Update filters for price range
  const updateFilter = (updates: { minPrice: number | null, maxPrice: number | null }) => {
    if (updates.minPrice !== null) {
      setPriceRange(prev => [updates.minPrice!, prev[1]]);
    }
    if (updates.maxPrice !== null) {
      setPriceRange(prev => [prev[0], updates.maxPrice!]);
    }
  };

  // Render wallet connection prompt
  const renderWalletPrompt = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg shadow-inner">
      <p className="text-lg text-gray-600 mb-4 text-center">Connect your wallet to buy memory NFTs</p>
      <WalletMultiButton />
    </div>
  );

  // Render memory list
  const renderMemories = () => {
    if (loading) {
      return (
        <div className="col-span-full flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="col-span-full py-10">
          <div className="text-center text-red-500">{error}</div>
          <button 
            onClick={() => refreshMemories()}
            className="mx-auto mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          > 
            Retry
          </button>
        </div>
      );
    }

    if (memories.length === 0) {
      return (
        <div className="col-span-full text-center py-20">
          <p className="text-lg text-gray-500">No memories found matching your criteria</p>
        </div>
      );
    }

    return memories.map(memory => (
      <div key={memory.id} className="mb-6">
        <MemoryCard
          id={memory.id}
          name={memory.name}
          description={memory.description}
          memoryType={memory.memoryType}
          quality={memory.quality}
          imageUrl={memory.imageUrl}
          neuralFingerprint={memory.neuralFingerprint}
          price={memory.price}
          owner={memory.owner}
          mint={memory.mintAddress}
          isOwner={wallet.connected && memory.owner === wallet.publicKey?.toString()}
          onBuy={wallet.connected ? handleBuyMemory : undefined}
        />
      </div>
    ));
  };

  return (
    <>
      <Head>
        <title>Memory Marketplace | NeuraMint</title>
        <meta name="description" content="Browse and purchase memory NFTs" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Memory Marketplace</h1>
          
          {/* Search bar */}
          <div className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search memories..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                value={filters.searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                > 
                  Reset
                </button>
              </div>

              {/* Type filters */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Memory Type</h3>
                <div className="space-y-2">
                  {MEMORY_TYPES.map(type => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`type-${type}`}
                        checked={filters.types.includes(type)}
                        onChange={() => toggleTypeFilter(type)}
                        className="mr-2"
                      />
                      <label htmlFor={`type-${type}`} className="text-sm capitalize">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quality filters */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Memory Quality</h3>
                <div className="space-y-2">
                  {MEMORY_QUALITIES.map(quality => (
                    <div key={quality} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`quality-${quality}`}
                        checked={filters.qualities.includes(quality)}
                        onChange={() => toggleQualityFilter(quality)}
                        className="mr-2"
                      />
                      <label htmlFor={`quality-${quality}`} className="text-sm capitalize">
                        {quality}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price filters */}
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Price Range (SOL)</h3>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="text-xs text-gray-500">Min</label>
                    <input
                      type="number"
                      min="0"
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(e, 0)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Max</label>
                    <input
                      type="number"
                      min={priceRange[0]}
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(e, 1)}
                      className="input"
                    />
                  </div>
                </div>
                <button
                  onClick={applyPriceFilter}
                  className={`w-full py-2 rounded-md text-sm font-medium ${
                    isPriceFilterActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isPriceFilterActive ? 'Clear price filter' : 'Apply price filtering'}
                </button>
              </div>

              {/* Sort options */}
              <div>
                <h3 className="text-md font-medium mb-2">Sort By</h3>
                <select
                  value={sortOption}
                  onChange={(e) => updateSortOption(e.target.value as SortOption)}
                  className="input"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Memory list */}
          <div className="lg:col-span-3">
            {!wallet.connected && renderWalletPrompt()}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMemories()}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Market; 