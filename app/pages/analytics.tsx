import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from '../components/Layout';
import MemoryAnalytics from '../components/analytics/MemoryAnalytics';
import { ApiService } from '../services/apiService';
import { Memory } from '../types/memory';

const AnalyticsPage: React.FC = () => {
  const { publicKey } = useWallet();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create instance of ApiService
  const apiService = new ApiService();

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user's memories
        const userMemories = await apiService.getUserMemories(publicKey.toString());
        // Convert from MemoryNFT to Memory type
        const convertedMemories = userMemories.map(nft => ({
          id: nft.id,
          mint: nft.mintAddress,
          owner: nft.owner,
          name: nft.name,
          description: nft.description,
          imageUrl: nft.imageUrl,
          price: nft.price,
          isListed: nft.isListed,
          quality: nft.quality === 'Legendary' ? 4 : nft.quality === 'Excellent' ? 3 : nft.quality === 'Fine' ? 2 : 1,
          memoryType: nft.type,
          createdAt: new Date(nft.createdAt).getTime(),
          neuralFingerprint: nft.neuralFingerprint,
          uri: ''
        }));
        
        setMemories(convertedMemories);
        
        // Fetch recent sales for price reference
        const listings = await apiService.getMarketListings();
        const salesData = listings
          .filter(nft => nft.isListed && nft.price)
          .map(nft => ({
            id: nft.id,
            price: nft.price || 0,
            memory: {
              id: nft.id,
              quality: nft.quality === 'Legendary' ? 4 : nft.quality === 'Excellent' ? 3 : nft.quality === 'Fine' ? 2 : 1,
              memoryType: nft.type
            }
          }));
        
        setRecentSales(salesData);
      } catch (err) {
        console.error('Error fetching data for analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [publicKey, apiService]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Memory Analytics</h1>
        <p className="text-gray-600 mb-8">
          Gain insights into your memory collection and market trends
        </p>
        
        {!publicKey ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view analytics for your memory collection
            </p>
            <button 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => {/* Wallet connection is handled by the WalletConnect component */}}
            >
              Connect Wallet
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : memories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Memories Found</h2>
            <p className="text-gray-600 mb-6">
              You don't have any memories in your collection yet. Mint some memories to see analytics.
            </p>
            <a 
              href="/mint" 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Mint Memories
            </a>
          </div>
        ) : (
          <div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8">
              <h2 className="text-xl font-semibold mb-2">Collection Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500 text-sm">Total Memories</p>
                  <p className="text-2xl font-bold">{memories.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500 text-sm">Legendary</p>
                  <p className="text-2xl font-bold">
                    {memories.filter(m => m.quality === 4).length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500 text-sm">Excellent</p>
                  <p className="text-2xl font-bold">
                    {memories.filter(m => m.quality === 3).length}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-gray-500 text-sm">Listed for Sale</p>
                  <p className="text-2xl font-bold">
                    {memories.filter(m => m.isListed).length}
                  </p>
                </div>
              </div>
            </div>
            
            <MemoryAnalytics memories={memories} recentSales={recentSales} />
            
            <div className="mt-12 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="/mint" 
                  className="block text-center border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 transition-colors"
                >
                  Mint New Memory
                </a>
                <a 
                  href="/marketplace" 
                  className="block text-center border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 transition-colors"
                >
                  Browse Marketplace
                </a>
                <a 
                  href="/validate" 
                  className="block text-center border border-indigo-600 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-50 transition-colors"
                >
                  Validate Memories
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnalyticsPage; 