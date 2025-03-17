/**
 * Utilities for formatting and handling Solana addresses
 */

/**
 * Shortens a Solana address for display purposes
 * @param address The full Solana address
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Shortened address with ellipsis in the middle
 */
export const shortenAddress = (
  address: string, 
  startChars: number = 4, 
  endChars: number = 4
): string => {
  if (!address) {
    return '';
  }
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Validates a Solana address format
 * @param address The address to validate
 * @returns True if the address is valid
 */
export const isValidSolanaAddress = (address: string): boolean => {
  // Simple validation - Solana addresses are base58 encoded and 32-44 characters long
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  return address.length >= 32 && 
         address.length <= 44 && 
         base58Regex.test(address);
};

/**
 * Compares two Solana addresses for equality
 * @param address1 First address to compare
 * @param address2 Second address to compare
 * @returns True if addresses are equal
 */
export const areAddressesEqual = (
  address1: string | null | undefined, 
  address2: string | null | undefined
): boolean => {
  if (!address1 || !address2) {
    return false;
  }
  
  return address1.toLowerCase() === address2.toLowerCase();
};

/**
 * Formats an address with an ENS name if available
 * @param address The Solana address
 * @param ensName Optional ENS name
 * @returns Formatted address with ENS name if available
 */
export const formatAddressWithEns = (
  address: string, 
  ensName?: string | null
): string => {
  if (ensName) {
    return `${ensName} (${shortenAddress(address)})`;
  }
  
  return shortenAddress(address);
};

/**
 * Creates a Solana explorer URL for an address
 * @param address The Solana address
 * @param cluster The Solana cluster (e.g., 'mainnet-beta', 'devnet', 'testnet')
 * @returns Explorer URL
 */
export const getSolanaExplorerUrl = (
  address: string,
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'
): string => {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
};

/**
 * Creates a Solana explorer URL for a transaction
 * @param signature The transaction signature
 * @param cluster The Solana cluster (e.g., 'mainnet-beta', 'devnet', 'testnet')
 * @returns Explorer URL
 */
export const getSolanaExplorerTxUrl = (
  signature: string,
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' = 'mainnet-beta'
): string => {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}; 