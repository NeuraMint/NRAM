import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Image,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Tooltip,
  Progress,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Skeleton
} from '@chakra-ui/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { CountdownTimer } from '../common/CountdownTimer';
import { shortenAddress } from '../../utils/addressUtils';

// Types for auction component
interface Bid {
  bidder: string;
  bidderDisplayName?: string;
  amount: number;
  timestamp: Date;
}

interface AuctionMemory {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  creator: string;
  creatorDisplayName?: string;
  owner: string;
  ownerDisplayName?: string;
  quality: number;
  memoryType: string;
  startingPrice: number;
  currentBid: number;
  minimumBidIncrement: number;
  startTime: Date;
  endTime: Date;
  bids: Bid[];
}

interface MemoryAuctionProps {
  memory?: AuctionMemory;
  isLoading?: boolean;
  onPlaceBid?: (memoryId: string, bidAmount: number) => Promise<boolean>;
  onCancelAuction?: (memoryId: string) => Promise<boolean>;
  onClaimWinnings?: (memoryId: string) => Promise<boolean>;
}

const DEFAULT_MIN_INCREMENT = 0.05; // SOL

export const MemoryAuction: React.FC<MemoryAuctionProps> = ({
  memory,
  isLoading = false,
  onPlaceBid,
  onCancelAuction,
  onClaimWinnings
}) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const toast = useToast();
  
  // Bid modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format quality label
  const getQualityLabel = (quality: number) => {
    switch (quality) {
      case 4: return { label: 'Legendary', color: 'purple' };
      case 3: return { label: 'Excellent', color: 'blue' };
      case 2: return { label: 'Fine', color: 'green' };
      case 1: default: return { label: 'Common', color: 'gray' };
    }
  };
  
  // Calculate minimum bid
  const calculateMinimumBid = useCallback(() => {
    if (!memory) return 0;
    
    const minIncrement = memory.minimumBidIncrement || DEFAULT_MIN_INCREMENT;
    return memory.currentBid > 0 
      ? memory.currentBid + minIncrement 
      : memory.startingPrice;
  }, [memory]);
  
  // Set initial bid amount when modal opens or memory changes
  useEffect(() => {
    if (memory) {
      setBidAmount(calculateMinimumBid());
    }
  }, [memory, calculateMinimumBid]);
  
  // Handle bid submission
  const handlePlaceBid = async () => {
    if (!memory || !publicKey || !onPlaceBid) return;
    
    const minBid = calculateMinimumBid();
    
    if (bidAmount < minBid) {
      toast({
        title: 'Bid too low',
        description: `Minimum bid amount is ${minBid} SOL`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const success = await onPlaceBid(memory.id, bidAmount);
      
      if (success) {
        toast({
          title: 'Bid placed successfully!',
          description: `You've placed a bid of ${bidAmount} SOL on "${memory.name}"`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
      } else {
        throw new Error('Failed to place bid');
      }
    } catch (error) {
      toast({
        title: 'Failed to place bid',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle auction cancellation
  const handleCancelAuction = async () => {
    if (!memory || !publicKey || !onCancelAuction) return;
    
    // Only the owner can cancel an auction
    if (memory.owner !== publicKey.toBase58()) {
      toast({
        title: 'Cannot cancel auction',
        description: 'Only the owner can cancel an auction',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Cannot cancel an auction with bids
    if (memory.bids.length > 0) {
      toast({
        title: 'Cannot cancel auction',
        description: 'Auctions with bids cannot be cancelled',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const success = await onCancelAuction(memory.id);
      
      if (success) {
        toast({
          title: 'Auction cancelled successfully!',
          description: `You've cancelled the auction for "${memory.name}"`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to cancel auction');
      }
    } catch (error) {
      toast({
        title: 'Failed to cancel auction',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle claiming winnings
  const handleClaimWinnings = async () => {
    if (!memory || !publicKey || !onClaimWinnings) return;
    
    // Check if auction has ended
    const now = new Date();
    if (now < memory.endTime) {
      toast({
        title: 'Cannot claim yet',
        description: 'The auction has not ended yet',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Check if current user is the highest bidder
    const highestBid = memory.bids.length > 0 ? memory.bids[0] : null;
    
    if (!highestBid || highestBid.bidder !== publicKey.toBase58()) {
      toast({
        title: 'Cannot claim',
        description: 'Only the highest bidder can claim the memory',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const success = await onClaimWinnings(memory.id);
      
      if (success) {
        toast({
          title: 'Memory claimed successfully!',
          description: `You've claimed "${memory.name}" from the auction`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to claim memory');
      }
    } catch (error) {
      toast({
        title: 'Failed to claim memory',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if auction has ended
  const isAuctionEnded = memory ? new Date() > memory.endTime : false;
  
  // Check if current user is the highest bidder
  const isHighestBidder = memory && publicKey
    ? memory.bids.length > 0 && memory.bids[0].bidder === publicKey.toBase58()
    : false;
  
  // Check if current user is the owner
  const isOwner = memory && publicKey
    ? memory.owner === publicKey.toBase58()
    : false;
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        p={6}
      >
        <VStack spacing={6} align="stretch">
          <Skeleton height="300px" />
          <Skeleton height="40px" />
          <Skeleton height="20px" />
          <Skeleton height="100px" />
          <Skeleton height="60px" />
        </VStack>
      </Box>
    );
  }
  
  // Render error state if no memory is provided
  if (!memory) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        p={6}
        textAlign="center"
      >
        <Heading size="md" color="red.500">Auction Not Found</Heading>
        <Text mt={4}>The memory auction you're looking for doesn't exist or has been removed.</Text>
      </Box>
    );
  }
  
  // Format quality and type badges
  const quality = getQualityLabel(memory.quality);
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
    >
      {/* Memory Image */}
      <Image
        src={memory.imageUrl}
        alt={memory.name}
        width="100%"
        height="400px"
        objectFit="cover"
      />
      
      {/* Auction Info */}
      <Box p={6}>
        <VStack spacing={4} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg">{memory.name}</Heading>
            <HStack>
              <Badge colorScheme={quality.color} fontSize="sm" px={2} py={1}>
                {quality.label}
              </Badge>
              <Badge colorScheme="teal" fontSize="sm" px={2} py={1}>
                {memory.memoryType}
              </Badge>
            </HStack>
          </Flex>
          
          <Text>{memory.description}</Text>
          
          <Divider />
          
          {/* Auction Stats */}
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" gap={4}>
            <Stat>
              <StatLabel>Current Bid</StatLabel>
              <StatNumber>{memory.currentBid} SOL</StatNumber>
              <StatHelpText>
                {memory.bids.length > 0 
                  ? `${memory.bids.length} bid${memory.bids.length !== 1 ? 's' : ''}` 
                  : 'No bids yet'}
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Starting Price</StatLabel>
              <StatNumber>{memory.startingPrice} SOL</StatNumber>
              <StatHelpText>
                Min. increment: {memory.minimumBidIncrement || DEFAULT_MIN_INCREMENT} SOL
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>{isAuctionEnded ? 'Auction Ended' : 'Time Remaining'}</StatLabel>
              <StatNumber>
                {isAuctionEnded 
                  ? 'Ended' 
                  : <CountdownTimer targetDate={memory.endTime} />}
              </StatNumber>
              <StatHelpText>
                Ends {memory.endTime.toLocaleDateString()} at {memory.endTime.toLocaleTimeString()}
              </StatHelpText>
            </Stat>
          </Flex>
          
          <Divider />
          
          {/* Creator/Owner Info */}
          <Flex justify="space-between" wrap="wrap" gap={2}>
            <Box>
              <Text fontWeight="bold">Creator</Text>
              <Text>{memory.creatorDisplayName || shortenAddress(memory.creator)}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold">Current Owner</Text>
              <Text>{memory.ownerDisplayName || shortenAddress(memory.owner)}</Text>
            </Box>
          </Flex>
          
          {/* Action Buttons */}
          <Box pt={4}>
            {!isAuctionEnded ? (
              <Button 
                colorScheme="blue" 
                size="lg" 
                width="100%" 
                onClick={onOpen}
                isDisabled={isOwner}
              >
                {isOwner ? "You own this memory" : "Place Bid"}
              </Button>
            ) : (
              isHighestBidder && (
                <Button
                  colorScheme="green"
                  size="lg"
                  width="100%"
                  onClick={handleClaimWinnings}
                  isLoading={isSubmitting}
                >
                  Claim Your Memory
                </Button>
              )
            )}
            
            {isOwner && memory.bids.length === 0 && !isAuctionEnded && (
              <Button
                colorScheme="red"
                variant="outline"
                size="md"
                width="100%"
                mt={4}
                onClick={handleCancelAuction}
                isLoading={isSubmitting}
              >
                Cancel Auction
              </Button>
            )}
          </Box>
          
          {/* Bid History */}
          {memory.bids.length > 0 && (
            <Box mt={6}>
              <Heading size="md" mb={3}>Bid History</Heading>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Bidder</Th>
                      <Th isNumeric>Amount</Th>
                      <Th>Time</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {memory.bids.map((bid, index) => (
                      <Tr key={index} bg={index === 0 ? "blue.50" : undefined}>
                        <Td>
                          {bid.bidderDisplayName || shortenAddress(bid.bidder)}
                          {publicKey && bid.bidder === publicKey.toBase58() && " (You)"}
                        </Td>
                        <Td isNumeric>{bid.amount} SOL</Td>
                        <Td>{bid.timestamp.toLocaleString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </VStack>
      </Box>
      
      {/* Bid Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Place a Bid</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>You are bidding on <strong>{memory.name}</strong></Text>
              
              <FormControl>
                <FormLabel>Bid Amount (SOL)</FormLabel>
                <NumberInput
                  min={calculateMinimumBid()}
                  step={0.1}
                  precision={3}
                  value={bidAmount}
                  onChange={(valueString) => setBidAmount(parseFloat(valueString))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Minimum bid: {calculateMinimumBid()} SOL
                </FormHelperText>
              </FormControl>
              
              <Box width="100%">
                <Text fontWeight="bold">Bidding Rules:</Text>
                <Text fontSize="sm">
                  • Your SOL will be held in escrow until the auction ends.<br />
                  • If you're outbid, your SOL will be returned to your wallet.<br />
                  • If you win, you'll need to claim your memory after the auction ends.<br />
                  • All bids are final and cannot be withdrawn.
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handlePlaceBid}
              isLoading={isSubmitting}
              isDisabled={bidAmount < calculateMinimumBid()}
            >
              Place Bid
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MemoryAuction;