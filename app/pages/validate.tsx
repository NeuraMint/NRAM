import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ValidationService, ValidationRequest, ValidatorStats, ValidationError, ValidationErrorType } from '../services/validationService';
import { MintService } from '../services/mintService';
import { toast } from 'react-hot-toast';
import config from '../config/environment';
import { getImageUrlFromIPFS } from '../utils/ipfsUtils';
import { PublicKey } from '@solana/web3.js';
import { MemoryType, MemoryQuality } from '../hooks/useMemoryMarket';
import Image from 'next/image';

// Memory type interface
interface MemoryToValidate {
  mint: string;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
  quality: MemoryQuality;
  memoryType: MemoryType;
  submittedBy: string;
  submittedAt: number;
  neuralSignature: string;
  brainRegion?: string;
  emotionalValence?: number;
  cognitiveLoad?: number;
  status: 'pending' | 'approved' | 'rejected';
  uri: string;
}

const ValidateMemory = () => {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  
  // State management
  const [memories, setMemories] = useState<MemoryToValidate[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryToValidate | null>(null);
  const [validationScore, setValidationScore] = useState<number>(50);
  const [validationComment, setValidationComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [validatorStats, setValidatorStats] = useState<ValidatorStats | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<number>(1000);
  
  // Service instances
  const validationService = new ValidationService();
  const mintService = new MintService(useWallet());
  
  // Load validator state
  const loadValidatorState = useCallback(async () => {
    if (!connected || !publicKey) return;
    
    try {
      setIsLoading(true);
      // Check if user is a validator
      const isUserValidator = await validationService.isValidator(publicKey);
      
      if (isUserValidator) {
        // If user is a validator, get validator statistics
        const stats = await validationService.getValidatorStats(publicKey);
        setValidatorStats(stats);
        
        // Load memories to be validated
        await loadMemoriesToValidate();
      } else {
        setValidatorStats(null);
      }
    } catch (error) {
      console.error('Error loading validator state:', error);
      
      // Use standardized error handling
      if (error instanceof ValidationError) {
        switch (error.type) {
          case ValidationErrorType.CONNECTION_FAILED:
            toast.error('Network connection error, please check your internet connection');
            break;
          case ValidationErrorType.INVALID_ADDRESS:
            toast.error('Invalid wallet address');
            break;
          default:
            toast.error(`Unable to load validator information: ${error.message}`);
        }
      } else {
        toast.error('[Chinese UI text] Unable to load validator information');
      }
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey]);
  
  // Load memories to be validated
  const loadMemoriesToValidate = async () => {
    if (!connected || !publicKey) return;
    
    try {
      setIsLoading(true);
      
      // Get the list of memories to be validated from the validation service
      const pendingValidations = await validationService.getPendingValidations();
      
      if (pendingValidations.length === 0) {
        setMemories([]);
        setIsLoading(false);
        return;
      }
      
      // Load detailed information for each memory
      const memoriesWithDetails = await Promise.all(
        pendingValidations.map(async (validation: any) => {
          try {
            // [Chinese comment] Here we use IPFS or other storage services to get memory metadata
            const metadataUrl = `https://arweave.net/sample-uri-${validation.memoryMint.substring(0, 8)}`;
            
            // Simulate getting metadata; in a real project, it should be fetched from IPFS or Arweave
            const metadata = {
              name: `Memory #${validation.memoryMint.substring(0, 4)}`,
              description: `This is a memory that needs validation, submitted by ${validation.owner.substring(0, 8)} submitted`,
              image: `https://picsum.photos/seed/${validation.memoryMint.substring(0, 8)}/400/300`,
              attributes: [
                { trait_type: "Quality", value: getRandomQuality() },
                { trait_type: "Type", value: getRandomType() },
                { trait_type: "Neural Signature", value: `0x${validation.memoryMint.substring(0, 16)}` },
                { trait_type: "Brain Region", value: getRandomBrainRegion() },
                { trait_type: "Emotional Valence", value: Math.floor(Math.random() * 10) },
                { trait_type: "Cognitive Load", value: Math.floor(Math.random() * 10) }
              ]
            };
            
            return {
              mint: validation.memoryMint,
              owner: validation.owner,
              name: metadata.name,
              description: metadata.description,
              imageUrl: metadata.image,
              quality: metadata.attributes.find(attr => attr.trait_type === "Quality")?.value as MemoryQuality,
              memoryType: metadata.attributes.find(attr => attr.trait_type === "Type")?.value as MemoryType,
              submittedBy: validation.owner,
              submittedAt: validation.submittedAt,
              neuralSignature: metadata.attributes.find(attr => attr.trait_type === "Neural Signature")?.value as string,
              brainRegion: metadata.attributes.find(attr => attr.trait_type === "Brain Region")?.value as string,
              emotionalValence: metadata.attributes.find(attr => attr.trait_type === "Emotional Valence")?.value as number,
              cognitiveLoad: metadata.attributes.find(attr => attr.trait_type === "Cognitive Load")?.value as number,
              status: 'pending',
              uri: metadataUrl
            };
          } catch (error) {
            console.error('Error loading memory details:', error);
            return null;
          }
        })
      );
      
      // Filter out memories that failed to load
      const validMemories = memoriesWithDetails.filter(memory => memory !== null) as MemoryToValidate[];
      setMemories(validMemories);
    } catch (error) {
      console.error('Error loading memories to validate:', error);
      toast.error('Unable to load memories to be validated');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function - randomly generate memory quality
  const getRandomQuality = (): MemoryQuality => {
    const qualities: MemoryQuality[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  };
  
  // Helper function - randomly generate memory type
  const getRandomType = (): MemoryType => {
    const types: MemoryType[] = ['visual', 'conceptual', 'emotional', 'procedural', 'episodic', 'spatial'];
    return types[Math.floor(Math.random() * types.length)];
  };
  
  // Helper function - randomly generate brain region
  const getRandomBrainRegion = (): string => {
    const regions = ['Hippocampus', 'Amygdala', 'Prefrontal Cortex', 'Visual Cortex', 'Cerebellum'];
    return regions[Math.floor(Math.random() * regions.length)];
  };

  // Monitor wallet connection status
  useEffect(() => {
    if (connected && publicKey) {
      loadValidatorState();
    } else {
      setValidatorStats(null);
      setMemories([]);
      setSelectedMemory(null);
      setIsLoading(false);
    }
  }, [connected, publicKey, loadValidatorState]);
  
  // Submit validation results
  const handleValidationSubmit = async () => {
    if (!connected || !publicKey || !selectedMemory) return;
    
    try {
      setIsSubmitting(true);
      
      // Show loading state
      toast.loading('Submitting validation...', { id: 'submit-validation' });
      
      // Create validation request
      const validationRequest: ValidationRequest = {
        memoryMint: new PublicKey(selectedMemory.mint),
        validationScore: validationScore,
        isValid: validationScore >= 50, // Score greater than or equal to 50 is considered valid
        comment: validationComment
      };
      
      // Submit validation
      const signature = await validationService.submitValidation(publicKey, validationRequest);
      
      toast.success('[Chinese UI text] Validation submitted successfully!', {
        id: 'submit-validation',
        icon: '✅',
        duration: 5000,
      });
      
      console.log('Validation transaction signature:', signature);
      
      // Remove validated memory from the memory list
      setMemories(prevMemories => 
        prevMemories.filter(memory => memory.mint !== selectedMemory.mint)
      );
      
      // Reload validator state
      await loadValidatorState();
      
      // Reset selection and score
      setSelectedMemory(null);
      setValidationScore(50);
      setValidationComment('');
    } catch (error) {
      console.error('Error submitting validation:', error);
      
      // Refine error handling
      if (error instanceof ValidationError) {
        switch (error.type) {
          case ValidationErrorType.CONNECTION_FAILED:
            toast.error('Network connection error, please try again later', {
              id: 'submit-validation',
              icon: '❌',
              duration: 5000,
            });
            break;
          case ValidationErrorType.INSUFFICIENT_FUNDS:
            toast.error('Insufficient balance to perform this operation', {
              id: 'submit-validation',
              icon: '❌',
              duration: 5000,
            });
            break;
          case ValidationErrorType.NOT_VALIDATOR:
            toast.error('[Chinese UI text] You are not a validator, cannot submit validation', {
              id: 'submit-validation',
              icon: '❌',
              duration: 5000,
            });
            break;
          default:
            toast.error(`Validation submission failed: ${error.message}`, {
              id: 'submit-validation',
              icon: '❌',
              duration: 5000,
            });
        }
      } else if (error instanceof Error) {
        toast.error(`Validation submission failed: ${error.message}`, {
          id: 'submit-validation',
          icon: '❌',
          duration: 5000,
        });
      } else {
        toast.error('[Chinese UI text] Validation submission failed, please try again', {
          id: 'submit-validation',
          icon: '❌',
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Register as a validator
  const handleRegisterValidator = async () =>[Chinese UI text]  {
    if (!connected || !publicKey) return;
    
    try {
      setIsRegistering(true);
      
      // Show loading state
      toast.loading('Registering as validator...', { id: 'register-validator' });
      
      // Minimum stake amount (1000 NRAM)
      const minStake = 1000;
      
      // Check if stake amount is sufficient
      if (stakeAmount < minStake) {
        toast.error(`Stake amount must be at least ${minStake} NRAM`, { id: 'register-validator' });
        return;
      }
      
      // Register validator
      const signature = await validationService.registerValidator(
        publicKey,
        stakeAmount * 1000000000 // Convert to lamports
      );
      
      toast.success('[Chinese UI text] Validator registration successful!', {
        id: 'register-validator',
        icon: '🎉',
        duration: 5000,
      });
      console.log('Registration transaction signature:', signature);
      
      // Reload validator state
      await loadValidatorState();
    } catch (error) {
      console.error('Error registering validator:', error);
      
      // Refine error handling
      if (error instanceof ValidationError) {
        switch (error.type) {
          case ValidationErrorType.CONNECTION_FAILED:
            toast.error('Network connection error, please try again later', {
              id: 'register-validator',
              icon: '❌',
              duration: 5000,
            });
            break;
          case ValidationErrorType.INSUFFICIENT_FUNDS:
            toast.error('[Chinese UI text] Your balance is insufficient to cover the stake amount and transaction fees', {
              id: 'register-validator',
              icon: '❌',
              duration: 5000,
            });
            break;
          case ValidationErrorType.REGISTRATION_FAILED:
            toast.error('[Chinese UI text] Validator registration failed, please try again later', {
              id: 'register-validator',
              icon: '❌',
              duration: 5000,
            });
            break;
          default:
            toast.error(`Validator registration failed: ${error.message}`, {
              id: 'register-validator',
              icon: '❌',
              duration: 5000,
            });
        }
      } else if (error instanceof Error) {
        toast.error(`Validator registration failed: ${error.message}`, {
          id: 'register-validator',
          icon: '❌',
          duration: 5000,
        });
      } else {
        toast.error('[Chinese UI text] Validator registration failed, please try again', {
          id: 'register-validator',
          icon: '❌',
          duration: 5000,
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // Claim validation rewards
  const handleClaimRewards = async () => {
    if (!connected || !publicKey || !validatorStats) return;
    
    // Check if there are rewards to claim
    if (validatorStats.pendingRewards <= 0) {
      toast.error('[Chinese UI text] No rewards to claim');
      return;
    }
    
    try {
      // Show loading state
      toast.loading('Claiming rewards...', { id: 'claim-rewards' });
      
      // Call validation service to claim rewards
      const signature = await validationService.claimRewards(publicKey);
      
      // Success prompt
      toast.success('Rewards claimed successfully!', {
        id: 'claim-rewards',
        icon: '💰',
        duration: 5000,
      });
      
      console.log('Reward claim transaction signature:', signature);
      
      // Reload validator state
      await loadValidatorState();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      
      // Refine error handling
      if (error instanceof ValidationError) {
        switch (error.type) {
          case ValidationErrorType.CONNECTION_FAILED:
            toast.error('Network connection error, please try again later', {
              id: 'claim-rewards',
              icon: '❌',
              duration: 5000,
            });
            break;
          case ValidationErrorType.REWARD_CLAIM_FAILED:
            toast.error('[Chinese UI text] Failed to claim rewards，请稍后再试', {
              id: 'claim-rewards',
              icon: '❌',
              duration: 5000,
            });
            break;
          case ValidationErrorType.NOT_VALIDATOR:
            toast.error('[Chinese UI text] You are not a validator, cannot claim rewards', {
              id: 'claim-rewards',
              icon: '❌',
              duration: 5000,
            });
            break;
          default:
            toast.error(`Error claiming rewards: ${error.message}`, {
              id: 'claim-rewards',
              icon: '❌',
              duration: 5000,
            });
        }
      } else if (error instanceof Error) {
        toast.error(`Error claiming rewards: ${error.message}`, {
          id: 'claim-rewards',
          icon: '❌',
          duration: 5000,
        });
      } else {
        toast.error('Failed to claim rewards, please try again', {
          id: 'claim-rewards',
          icon: '❌',
          duration: 5000,
        });
      }
    }
  };

  // Memory selection
  const handleMemorySelection = (memory: MemoryToValidate) => {
    setSelectedMemory(memory);
    // Reset validation input
    setValidationScore(50);
    setValidationComment('');
  };

  // Quality color mapping
  const qualityColors = {
    common: 'bg-gray-500',
    fine: 'bg-blue-500',
    excellent: 'bg-purple-500',
    legendary: 'bg-amber-500'
  };

  // Type icon mapping
  const typeIcons = {
    cognitive: '🧠',
    emotional: '❤️',
    cultural: '🏛️',
    therapeutic: '🏥'
  };

  // Emotion icon mapping
  const emotionIcons: Record<string, string> = {
    common: '😐',
    uncommon: '🙂',
    rare: '😊',
    epic: '😃',
    legendary: '🤩'
  };
  
  // [Chinese comment] Memory type icon mapping
  const memoryTypeIcons: Record<string, string> = {
    visual: '👁️',
    conceptual: '💡',
    emotional: '❤️',
    procedural: '🔄',
    episodic: '📖',
    spatial: '🗺️'
  };

  // Format address
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Validator requirements section
  const renderValidatorRequirements = () => {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-bold mb-4">[Chinese UI text] Become a Memory Validator</h3>
        <p className="mb-4">[Chinese UI text] 
          Validators are responsible for evaluating the authenticity and quality of memories. By staking NRAM tokens, you can participate in the validation process and earn rewards.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-bold mb-2">[Chinese UI text] Requirements</h4>
            <ul className="list-disc list-inside">
              <li>[Chinese UI text] Minimum stake: 1000 NRAM</li>
              <li>[Chinese UI text] Validation accuracy: at least 85%</li>
              <li>[Chinese UI text] Activity: at least 10 validations per week</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Rewards</h4>
            <ul className="list-disc list-inside">
              <li>[Chinese UI text] Each validation: 5-20 NRAM</li>
              <li>[Chinese UI text] Accuracy bonus: up to 10% additional rewards</li>
              <li>[Chinese UI text] 质押Rewards: 年化10%</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium mb-2">[Chinese UI text] 
              质押金额 (NRAM)
            </label>
            <input
              type="number"
              min="1000"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-2"
            />
          </div>
          
          <button
            onClick={handleRegisterValidator}
            disabled={isRegistering || !connected || stakeAmount < 1000}
            className="w-full md:w-1/2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {isRegistering ? '注册中...' : 'Register as a validator'}
          </button>
        </div>
      </div>
    );
  };

  // Render memory card
  const renderMemoryCard = (memory: MemoryToValidate) => {
    const isSelected = selectedMemory?.mint === memory.mint;
    
    return (
      <motion.div
        key={memory.mint}
        whileHover={{ scale: 1.02 }}
        className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer border-2 ${
          isSelected ? 'border-purple-500' : 'border-transparent'
        }`}
        onClick={() => setSelectedMemory(memory)}
      >
        <div className="relative h-48">
          <Image
            src={memory.imageUrl || '/placeholder-memory.jpg'}
            alt={memory.name}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
            {memory.quality}
          </div>
          <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
            {memory.memoryType}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 truncate">{memory.name}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{memory.description}</p>
          
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <span className="mr-1">👤</span>
              <span>{formatAddress(memory.owner)}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-1">🕒</span>
              <span>{formatDate(memory.submittedAt)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Validate memory details component
  const renderMemoryDetail = () => {
    if (!selectedMemory) return null;
    
    return (
      <div className="bg-gray-800 rounded-xl p-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={selectedMemory.imageUrl || '/placeholder-memory.jpg'}
                alt={selectedMemory.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-xs text-gray-400">[Chinese UI text] 品质</h4>
                <p className="font-semibold">{selectedMemory.quality}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-xs text-gray-400">[Chinese UI text] 类型</h4>
                <p className="font-semibold">{selectedMemory.memoryType}</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-xs text-gray-400">[Chinese UI text] 情感值</h4>
                <p className="font-semibold">{selectedMemory.emotionalValence}/10</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <h4 className="text-xs text-gray-400">[Chinese UI text] 认知负荷</h4>
                <p className="font-semibold">{selectedMemory.cognitiveLoad}/10</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedMemory.name}</h2>
              <p className="text-gray-300">{selectedMemory.description}</p>
            </div>
            
            <div className="space-y-2">
              <div>
                <h4 className="text-sm text-gray-400">[Chinese UI text] submitted者</h4>
                <p className="font-mono text-sm">{formatAddress(selectedMemory.owner)}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-400">[Chinese UI text] submitted时间</h4>
                <p>{formatDate(selectedMemory.submittedAt)}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-400">[Chinese UI text] 神经签名</h4>
                <p className="font-mono text-sm truncate">{selectedMemory.neuralSignature}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-400">[Chinese UI text] 脑区</h4>
                <p>{selectedMemory.brainRegion}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <h3 className="font-bold mb-3">[Chinese UI text] Validate评分</h3>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span>[Chinese UI text] 无效 (0)</span>
                  <span>[Chinese UI text] 有效 (100)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={validationScore}
                  onChange={(e) => setValidationScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center mt-2">
                  <span className="text-2xl font-bold">{validationScore}</span>
                  <span className="text-gray-400 ml-1">/ 100</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">[Chinese UI text] 
                  评论 (可选)
                </label>
                <textarea
                  value={validationComment}
                  onChange={(e) => setValidationComment(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 h-24"
                  placeholder="添加关于此记忆的评论或反馈..."
                />
              </div>
              
              <button
                onClick={handleValidationSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>[Chinese UI text] 
                    submitted中...
                  </span>
                ) : (
                  'Submit validation'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>[Chinese UI text] Validate记忆 | NeuraMint</title>
        <meta name="description" content="为NeuraMint平台上的记忆进行Validate，赚取Rewards" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <main className="container mx-auto px-4 py-6 md:py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-24 h-24">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-20 h-20 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
            </div>
            <p className="mt-4 text-xl">[Chinese UI text] 加载中...</p>
          </div>
        ) : !connected ? (
          <div className="max-w-lg mx-auto text-center p-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">[Chinese UI text] 连接钱包以继续</h1>
            <p className="mb-6 md:mb-8 text-gray-300">[Chinese UI text] 
              您需要连接钱包才能参与记忆Validate。Validate记忆可以赚取NRAM代币Rewards。
            </p>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">[Chinese UI text] 记忆Validate</h1>
            <p className="text-gray-300 mb-6 md:mb-8">[Chinese UI text] Validate记忆的真实性和品质，获取NRAM代币Rewards</p>
            
            {!validatorStats ? (
              renderValidatorRequirements()
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="lg:col-span-1 space-y-4 md:space-y-8">
                  <div className="bg-gray-800 rounded-xl p-4 md:p-6">
                    <h2 className="text-xl font-bold mb-4">[Chinese UI text] Validate者统计</h2>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">[Chinese UI text] 总Validate数</span>
                        <span className="font-bold">{validatorStats.completedValidations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">[Chinese UI text] 成功率</span>
                        <span className="font-bold">{validatorStats.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">[Chinese UI text] 声誉分数</span>
                        <div className="flex items-center">
                          <div className="w-16 md:w-24 h-3 bg-gray-700 rounded-full mr-2">
                            <div 
                              className="h-3 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full" 
                              style={{ width: `${validatorStats.reputation}%` }}
                            ></div>
                          </div>
                          <span className="font-bold">{validatorStats.reputation}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">[Chinese UI text] 质押金额</span>
                        <span className="font-bold">{(validatorStats.stakedAmount / 1000000000).toFixed(2)} NRAM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">[Chinese UI text] 待领取Rewards</span>
                        <span className="font-bold text-green-400">{(validatorStats.pendingRewards / 1000000000).toFixed(4)} NRAM</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleClaimRewards()}
                      disabled={validatorStats.pendingRewards <= 0}
                      className="w-full mt-4 md:mt-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      {validatorStats.pendingRewards <= 0 ? "无可领取Rewards" : "领取Rewards"}
                    </button>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-4 md:p-6">
                    <h2 className="text-xl font-bold mb-4">[Chinese UI text] Validate指南</h2>
                    <ul className="space-y-2 text-gray-300 text-sm md:text-base">
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-400">•</span>[Chinese UI text] 
                        仔细检查记忆的神经签名是否有效
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-400">•</span>[Chinese UI text] 
                        确认记忆内容与描述一致
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-400">•</span>[Chinese UI text] 
                        评估记忆的情感值和认知负荷是否合理
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-400">•</span>[Chinese UI text] 
                        检查记忆类型和品质标记是否准确
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2 text-purple-400">•</span>[Chinese UI text] 
                        给予公正的评分，以维护平台的完整性
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  {selectedMemory ? (
                    renderMemoryDetail()
                  ) : memories.length > 0 ? (
                    <div>
                      <h2 className="text-xl font-bold mb-4">[Chinese UI text] 选择记忆进行Validate</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {memories.map(memory => renderMemoryCard(memory))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800 p-6 md:p-8 rounded-xl text-center">
                      <div className="text-4xl md:text-5xl mb-4">🎉</div>
                      <h3 className="text-lg md:text-xl font-bold mb-2">[Chinese UI text] 所有记忆都已Validate!</h3>
                      <p className="text-gray-300 mb-4">[Chinese UI text] 
                        目前没有待Validate的记忆。请稍后再来查看新的Validate任务。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ValidateMemory; 