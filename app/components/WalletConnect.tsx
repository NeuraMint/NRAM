import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { truncateAddress } from '../utils/walletUtils';

interface WalletConnectProps {
  onConnectSuccess?: () => void;
  className?: string;
}

const WalletConnect: FC<WalletConnectProps> = ({ onConnectSuccess, className = '' }) => {
  const { connected, publicKey, connecting, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  useEffect(() => {
    if (connected && onConnectSuccess) {
      onConnectSuccess();
    }
  }, [connected, onConnectSuccess]);

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      // Could add toast notification here
      setShowDropdown(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {!connected ? (
        <WalletMultiButton className="connect-wallet-btn" />
      ) : (
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg shadow-md hover:from-purple-700 hover:to-blue-600"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <img 
              src="/images/wallet.svg" 
              alt="Wallet" 
              className="w-5 h-5 mr-2" 
            />
            {publicKey && truncateAddress(publicKey.toString())}
            <svg 
              className={`w-4 h-4 ml-2 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </motion.button>

          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 overflow-hidden"
            >
              <button
                onClick={copyAddress}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
                Copy Address
              </button>
              <a
                href={`https://explorer.solana.com/address/${publicKey?.toString()}${process.env.NODE_ENV !== 'production' ? '?cluster=devnet' : ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                View on Explorer
              </a>
              <button
                onClick={handleDisconnect}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Disconnect
              </button>
            </motion.div>
          )}
        </div>
      )}

      {connecting && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Connecting wallet...
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 