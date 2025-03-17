import { PublicKey, Connection, TransactionSignature, ConfirmOptions } from '@solana/web3.js';
import {
  getConnection,
  getValidatorPDA,
  registerValidator as registerValidatorOnChain,
  submitValidation as submitValidationOnChain,
  getValidatorInfo,
  getMemoriesToValidate,
  claimValidationRewards,
  DEFAULT_COMMITMENT
} from '../utils/solanaUtils';
import config from '../config/environment';

// Validation request interface
export interface ValidationRequest {
  memoryMint: PublicKey;
  validationScore: number; // 0-100
  isValid: boolean;
  comment?: string;
}

// Validation statistics interface
export interface ValidationStats {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  pendingCount: number;
  averageScore: number;
}

// Validator statistics interface
export interface ValidatorStats {
  publicKey: PublicKey;
  completedValidations: number;
  successRate: number;
  totalRewards: number;
  pendingRewards: number;
  weeklyRewards: number;
  stakedAmount: number;
  isActive: boolean;
  reputation: number; // 0-100
}

// Pending validation interface
export interface PendingValidation {
  memoryMint: string;
  owner: string;
  submittedAt: number;
}

// Possible validation error types
export enum ValidationErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  REGISTRATION_FAILED = 'REGISTRATION_FAILED',
  REWARD_CLAIM_FAILED = 'REWARD_CLAIM_FAILED',
  NOT_VALIDATOR = 'NOT_VALIDATOR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Custom validation error class
export class ValidationError extends Error {
  type: ValidationErrorType;
  
  constructor(message: string, type: ValidationErrorType) {
    super(message);
    this.type = type;
    this.name = 'ValidationError';
  }
}

/**
 * Memory Validation Service - Handles interactions with validator program
 */
export class ValidationService {
  private connection: Connection;
  private readonly confirmOptions: ConfirmOptions;
  
  /**
   * Initialize validation service
   */
  constructor() {
    // Initialize connection to blockchain
    this.connection = getConnection(config.rpcEndpoint);
    
    // Set default confirmation options
    this.confirmOptions = {
      commitment: DEFAULT_COMMITMENT,
      preflightCommitment: DEFAULT_COMMITMENT,
      maxRetries: 3
    };
  }
  
  /**
   * Get validator statistics
   * @param validatorWallet - Validator wallet address
   * @returns Validator statistics
   * @throws ValidationError if operation fails
   */
  async getValidatorStats(validatorWallet: PublicKey): Promise<ValidatorStats | null>  {
    try {
      if (!validatorWallet) {
        throw new ValidationError(
          'Invalid validator wallet address', 
          ValidationErrorType.INVALID_ADDRESS
        );
      }
      
      // Get validator info from blockchain
      const validatorInfo = await getValidatorInfo(this.connection, validatorWallet);
      
      // Return null if validator doesn't exist
      if (!validatorInfo) return null;
      
      // Convert on-chain data to ValidatorStats format
      return {
        publicKey: validatorWallet,
        completedValidations: validatorInfo.completedValidations || 0,
        successRate: validatorInfo.successRate || 0,
        totalRewards: validatorInfo.totalRewards || 0,
        pendingRewards: validatorInfo.pendingRewards || 0,
        weeklyRewards: validatorInfo.weeklyRewards || 0,
        stakedAmount: validatorInfo.stakedAmount || 0,
        isActive: validatorInfo.isActive || false,
        reputation: validatorInfo.reputation || 0
      };
    } catch (error: any) {
      console.error('Error getting validator statistics:', error);
      
      // Determine error type
      if (error instanceof ValidationError) {
        throw error;
      }
      
      if (error.message?.includes('connection')) {
        throw new ValidationError(
          'Failed to connect to Solana network', 
          ValidationErrorType.CONNECTION_FAILED
        );
      }
      
      // In development environment, return mock data
      if (config.environment !== 'production') {
        console.log('Using mock data');
        return {
          publicKey: validatorWallet,
          completedValidations: 42,
          successRate: 95.2,
          totalRewards: 1250000000,
          pendingRewards: 250000000,
          weeklyRewards: 150000000,
          stakedAmount: 1000000000,
          isActive: true,
          reputation: 87
        };
      }
      
      throw new ValidationError(
        '获取Validate者统计信息失败', // Get validator statistics failed
        ValidationErrorType.UNKNOWN_ERROR
      );
    }
  }
  
  /**
   * Submit memory validation
   * @param validatorWallet - Validator wallet address
   * @param validationRequest - Validation request data
   * @returns Transaction signature
   * @throws ValidationError if operation fails
   */
  async submitValidation(
    validatorWallet: PublicKey,
    validationRequest: ValidationRequest
  ): Promise<TransactionSignature> {
    try {
      if (!validatorWallet) {
        throw new ValidationError(
          'Invalid validator wallet address', 
          ValidationErrorType.INVALID_ADDRESS
        );
      }
      
      // Validate request parameters
      if (validationRequest.validationScore < 0 || validationRequest.validationScore > 100) {
        throw new ValidationError(
          'Validation score must be between 0 and 100', 
          ValidationErrorType.VALIDATION_FAILED
        );
      }
      
      // Check if user is a validator
      const isValidator = await this.isValidator(validatorWallet);
      if (!isValidator) {
        throw new ValidationError(
          'Only registered validators can submit validations', 
          ValidationErrorType.NOT_VALIDATOR
        );
      }
      
      // Get memory ID
      const memoryId = validationRequest.memoryMint.toString();
      
      // Submit validation to blockchain
      const result = await submitValidationOnChain(
        this.connection,
        { publicKey: validatorWallet }, // Simplified wallet object, use complete wallet in actual implementation
        memoryId,
        validationRequest.validationScore,
        validationRequest.comment || ''
      );
      
      if (!result) {
        throw new ValidationError(
          'Validatesubmitted失败', // Validation submission failed
          ValidationErrorType.VALIDATION_FAILED
        );
      }
      
      // Return actual transaction signature in production
      // Return mock signature in development
      if (config.environment === 'production') {
        return result;
      } else {
        // Simulate network delay
        await new Promise(resolve =>  setTimeout(resolve, 1000));
        return '4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM95zLnHmgvr3TQ1J4xtJRBo9YGAgLnvBfJoJ5JRJfLm1Sg';
      }
    } catch (error: any) {
      console.error('Error submitting validation:', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Handle specific error types
      if (error.message?.includes('insufficient funds')) {
        throw new ValidationError(
          'Insufficient balance to execute this transaction', // Insufficient balance to execute this transaction
          ValidationErrorType.INSUFFICIENT_FUNDS
        );
      }
      
      if (error.message?.includes('network') || error.message?.includes('connection')) {
        throw new ValidationError(
          'Network connection error, please try again later', // Network connection error, please try again later
          ValidationErrorType.CONNECTION_FAILED
        );
      }
      
      throw new ValidationError(
        error.message || 'Validatesubmitted失败', // Validation submission failed
        ValidationErrorType.VALIDATION_FAILED
      );
    }
  }
  
  /**
   * Claim validation rewards
   * @param validatorWallet - Validator wallet address
   * @returns Transaction signature
   * @throws ValidationError if operation fails
   */
  async claimRewards(validatorWallet: PublicKey): Promise<TransactionSignature> {
    try {
      if (!validatorWallet) {
        throw new ValidationError(
          'Invalid validator wallet address', 
          ValidationErrorType.INVALID_ADDRESS
        );
      }
      
      // Check if user is a validator
      const validatorStats = await this.getValidatorStats(validatorWallet);
      if (!validatorStats) {
        throw new ValidationError(
          'Only registered validators can claim rewards', 
          ValidationErrorType.NOT_VALIDATOR
        );
      }
      
      // Check if user has rewards to claim
      if (validatorStats.pendingRewards <= 0) {
        throw new ValidationError(
          'No rewards to claim', // No rewards to claim
          ValidationErrorType.REWARD_CLAIM_FAILED
        );
      }
      
      // In actual implementation, send transaction to blockchain
      // Use claimValidationRewards from solanaUtils
      const signature = await claimValidationRewards(
        this.connection,
        { publicKey: validatorWallet }, // Simplified wallet object, use complete wallet in actual implementation
        this.confirmOptions
      );
      
      if (!signature) {
        throw new ValidationError(
          'Failed to claim rewards', // Failed to claim rewards
          ValidationErrorType.REWARD_CLAIM_FAILED
        );
      }
      
      // In production environment, return actual signature
      // In development, return mock signature
      if (config.environment === 'production') {
        return signature;
      } else {
        // Simulate network delay
        await new Promise(resolve =>  setTimeout(resolve, 1500));
        return '5wBYqXSMTdJWrJMUfbYCFd6KjYb8oUHJQnZ82TQcjT2ar5rQwjxnYFcAWnGpJ5vA3XFTfM7PNS8Aw1UJvuRHyRKJ';
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Handle specific error types
      if (error.message?.includes('network') || error.message?.includes('connection')) {
        throw new ValidationError(
          'Network connection error, please try again later', // Network connection error, please try again later
          ValidationErrorType.CONNECTION_FAILED
        );
      }
      
      throw new ValidationError(
        error.message || 'Failed to claim rewards', // Failed to claim rewards
        ValidationErrorType.REWARD_CLAIM_FAILED
      );
    }
  }
  
  /**
   * Get memory validation records
   * @param memoryMint - Memory mint address
   * @returns Validation record statistics
   * @throws ValidationError if operation fails
   */
  async getMemoryValidations(memoryMint: PublicKey): Promise<ValidationStats> {
    try {
      if (!memoryMint) {
        throw new ValidationError(
          'Invalid memory mint address', 
          ValidationErrorType.INVALID_ADDRESS
        );
      }
      
      // TODO: Implement logic to get validation records from blockchain
      
      // Return mock data
      return {
        totalValidations: 15,
        validCount: 12,
        invalidCount: 2,
        pendingCount: 1,
        averageScore: 87,
      };
    } catch (error) {
      console.error('Error getting memory validations:', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Return empty statistics
      return {
        totalValidations: 0,
        validCount: 0,
        invalidCount: 0,
        pendingCount: 0,
        averageScore: 0,
      };
    }
  }
  
  /**
   * Check if address is a validator
   * @param walletAddress - Wallet address to check
   * @returns Whether the address is a validator
   * @throws ValidationError if operation fails
   */
  async isValidator(walletAddress: PublicKey): Promise<boolean> {
    try {
      if (!walletAddress) {
        throw new ValidationError(
          'Invalid wallet address', 
          ValidationErrorType.INVALID_ADDRESS
        );
      }
      
      // Method 1: Get validator PDA and check if it exists
      try {
        const [validatorPDA] = await getValidatorPDA(walletAddress);
        const accountInfo = await this.connection.getAccountInfo(validatorPDA);
        
        // If account exists, user is a validator
        if (accountInfo && accountInfo.data.length > 0) {
          return true;
        }
      } catch (pdaError) {
        console.warn('Error checking validator PDA:', pdaError);
        // Continue to method 2 if method 1 fails
      }
      
      // Method 2: Get validator statistics
      try {
        const stats = await this.getValidatorStats(walletAddress);
        return !!stats;
      } catch (statsError) {
        console.warn('Error getting validator stats:', statsError);
        // If both methods fail, return false
        return false;
      }
    } catch (error) {
      console.error('Error checking validator status:', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // If non-critical error, return false
      return false;
    }
  }
  
  /**
   * Register as a validator
   * @param walletAddress - Wallet address to register
   * @param stakeAmount - Stake amount (lamports)
   * @returns Transaction signature
   * @throws ValidationError if operation fails
   */
  async registerValidator(walletAddress: PublicKey, stakeAmount: number): Promise<TransactionSignature> {
    try {
      if (!walletAddress) {
        throw new ValidationError(
          'Invalid wallet address', 
          ValidationErrorType.INVALID_ADDRESS
        );
      }
      
      // Validate stake amount
      const minStake = 1000 * 1000000000; // 1000 NRAM in lamports
      if (stakeAmount < minStake) {
        throw new ValidationError(
          `At least ${minStake / 1000000000} NRAM tokens required to become a validator`, // At least 1000 NRAM tokens required to become a validator
          ValidationErrorType.INSUFFICIENT_FUNDS
        );
      }
      
      // Check if already a validator
      const isAlreadyValidator = await this.isValidator(walletAddress);
      if (isAlreadyValidator) {
        throw new ValidationError(
          'You are already a validator', // You are already a validator
          ValidationErrorType.REGISTRATION_FAILED
        );
      }
      
      // Call on-chain registration method
      const result = await registerValidatorOnChain(
        this.connection,
        { publicKey: walletAddress }, // Simplified wallet object, use complete wallet in actual implementation
        stakeAmount,
        this.confirmOptions
      );
      
      if (!result) {
        throw new ValidationError(
          'Validate者注册失败', // Validator registration failed
          ValidationErrorType.REGISTRATION_FAILED
        );
      }
      
      // Return transaction signature
      if (config.environment === 'production') {
        return result;
      } else {
        // Simulate network delay
        await new Promise(resolve =>  setTimeout(resolve, 2000));
        return '5wBYqXSMTdJWrJMUfbYCFd6KjYb8oUHJQnZ82TQcjT2ar5rQwjxnYFcAWnGpJ5vA3XFTfM7PNS8Aw1UJvuRHyRKJ';
      }
    } catch (error) {
      console.error('Error registering validator:', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Handle specific error types
      if (error.message?.includes('insufficient funds')) {
        throw new ValidationError(
          '余额不足以支付质押金额及交易费用', // Insufficient balance to cover stake amount and transaction fees
          ValidationErrorType.INSUFFICIENT_FUNDS
        );
      }
      
      if (error.message?.includes('network') || error.message?.includes('connection')) {
        throw new ValidationError(
          'Network connection error, please try again later', // Network connection error, please try again later
          ValidationErrorType.CONNECTION_FAILED
        );
      }
      
      throw new ValidationError(
        error.message || 'Validate者注册失败', // Validator registration failed
        ValidationErrorType.REGISTRATION_FAILED
      );
    }
  }
  
  /**
   * Get list of memories pending validation
   * @returns List of pending validations
   * @throws ValidationError if operation fails
   */
  async getPendingValidations(): Promise<PendingValidation[]> {
    try {
      // Get memories to validate from blockchain
      const memoriesToValidate = await getMemoriesToValidate(this.connection);
      
      // Convert to frontend format
      return memoriesToValidate.map(memory => ({
        memoryMint: memory.mint.toString(),
        owner: memory.owner.toString(),
        submittedAt: memory.timestamp
      }));
    } catch (error) {
      console.error('Error getting pending validations:', error);
      
      // In development environment, return mock data
      if (config.environment !== 'production') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return [
          {
            memoryMint: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
            owner: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAQmNTSWg6yAKdh',
            submittedAt: Date.now() - 86400000 // 1 day ago
          },
          {
            memoryMint: '2q7pyhPwAwZ3QMfZrnAbDhnh9mDUqycszcpf8bnGXhCM',
            owner: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAQmNTSWg6yAKdh',
            submittedAt: Date.now() - 172800000 // 2 days ago
          },
          {
            memoryMint: 'HwmcuNiV65QwS5JcJFbLJPZMuxwNuQnWPgkqnJPvYRGk',
            owner: 'Gs1MnB5PArhDFxJTZxmVnhqEFsZYUiJYQCdW7JVWjmC6',
            submittedAt: Date.now() - 259200000 // 3 days ago
          }
        ];
      }
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      if (error.message?.includes('network') || error.message?.includes('connection')) {
        throw new ValidationError(
          'Network connection error, please try again later', // Network connection error, please try again later
          ValidationErrorType.CONNECTION_FAILED
        );
      }
      
      // If error is not critical, return empty array
      return [];
    }
  }
} 