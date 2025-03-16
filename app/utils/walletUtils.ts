import { PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

/**
 * Truncates a wallet address for display purposes
 * @param address The full wallet address
 * @param startChars Number of characters to show at start
 * @param endChars Number of characters to show at end
 * @returns Truncated address string
 */
export const truncateAddress = (
  address: string,
  startChars: number = 4,
  endChars: number = 4
): string => {
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Validates if a string is a valid Solana address
 * @param address The address to validate
 * @returns Boolean indicating if address is valid
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Gets the Solana Explorer URL for an address or transaction
 * @param address The address or transaction signature
 * @param type The type of the identifier ('address' or 'tx')
 * @param network The Solana network to use
 * @returns The full explorer URL
 */
export const getSolanaExplorerUrl = (
  address: string,
  type: 'address' | 'tx' = 'address',
  network: WalletAdapterNetwork = WalletAdapterNetwork.Devnet
): string => {
  const clusterParam = network !== WalletAdapterNetwork.Mainnet 
    ? `?cluster=${network.toLowerCase()}` 
    : '';
    
  return `https://explorer.solana.com/${type}/${address}${clusterParam}`;
};

/**
 * Formats SOL amount with appropriate decimals
 * @param lamports Amount in lamports
 * @param decimals Number of decimal places to display
 * @returns Formatted SOL amount string
 */
export const formatSol = (lamports: number, decimals: number = 4): string => {
  const sol = lamports / 1_000_000_000; // Convert lamports to SOL
  return sol.toLocaleString('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

/**
 * Creates an icon URL from wallet address (for wallets without icons)
 * @param address The wallet address
 * @returns URL to a generated icon
 */
export const getWalletIconUrl = (address: string): string => {
  // This uses the jazzicon algorithm to generate a deterministic icon
  return `https://avatars.dicebear.com/api/jdenticon/${address}.svg`;
};

/**
 * Gets the appropriate wallet adapter network based on environment
 * @returns The wallet adapter network enum value
 */
export const getNetworkFromEnv = (): WalletAdapterNetwork => {
  const env = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  
  switch (env.toLowerCase()) {
    case 'mainnet':
    case 'mainnet-beta':
      return WalletAdapterNetwork.Mainnet;
    case 'testnet':
      return WalletAdapterNetwork.Testnet;
    case 'devnet':
    default:
      return WalletAdapterNetwork.Devnet;
  }
}; 