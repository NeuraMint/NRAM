import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  PopoverArrow, 
  PopoverCloseButton, 
  PopoverHeader, 
  PopoverBody,
  Input,
  InputGroup,
  InputRightElement,
  useClipboard,
  useToast,
  SimpleGrid,
  Tooltip,
  HStack,
  Text
} from '@chakra-ui/react';
import { 
  FaShare, 
  FaTwitter, 
  FaFacebook, 
  FaLink, 
  FaEnvelope,
  FaCheck,
  FaCopy,
  FaQrcode
} from 'react-icons/fa';
import QRCode from 'qrcode.react';

interface ShareMemoryProps {
  memoryId: string;
  memoryName: string;
  memoryImage?: string;
  memoryType?: string;
  memoryQuality?: number;
}

export const ShareMemory: React.FC<ShareMemoryProps> = ({
  memoryId,
  memoryName,
  memoryImage,
  memoryType,
  memoryQuality
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const toast = useToast();
  
  // Generate the share URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/memory/` 
    : 'https://neuramint.com/memory/';
  const shareUrl = `${baseUrl}${memoryId}`;
  
  // For copying the URL
  const { hasCopied, onCopy } = useClipboard(shareUrl);
  
  // Handle social media sharing
  const handleTwitterShare = () => {
    const text = `Check out my neural memory "${memoryName}" on NeuraMint! #NeuraMint #NFT #Solana`;
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    trackShare('twitter');
  };
  
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    trackShare('facebook');
  };
  
  const handleEmailShare = () => {
    const subject = `Check out my neural memory "${memoryName}" on NeuraMint!`;
    const body = `I wanted to share my neural memory NFT with you. You can view it here: ${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    trackShare('email');
  };
  
  // Track sharing events
  const trackShare = (platform: string) => {
    // Analytics tracking would go here in a real implementation
    console.log(`Memory shared on ${platform}`, { memoryId, platform });
    
    toast({
      title: "Shared successfully!",
      description: `Your memory has been shared on ${platform}.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    
    setIsOpen(false);
  };
  
  // Handle copy success
  const handleCopySuccess = () => {
    onCopy();
    toast({
      title: "URL copied!",
      description: "Memory URL has been copied to clipboard.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };
  
  return (
    <>
      <Popover
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setShowQR(false);
        }}
        placement="bottom"
        closeOnBlur={true}
      >
        <PopoverTrigger>
          <IconButton
            icon={<FaShare />}
            aria-label="Share Memory"
            colorScheme="blue"
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            size="md"
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader fontWeight="semibold">Share this Memory</PopoverHeader>
          <PopoverBody>
            {!showQR ? (
              <>
                <InputGroup size="md" mb={4}>
                  <Input
                    pr="4.5rem"
                    value={shareUrl}
                    isReadOnly
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleCopySuccess}>
                      {hasCopied ? <FaCheck /> : <FaCopy />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                
                <SimpleGrid columns={4} spacing={3} mb={4}>
                  <Tooltip label="Share on Twitter">
                    <IconButton
                      aria-label="Share on Twitter"
                      icon={<FaTwitter />}
                      colorScheme="twitter"
                      onClick={handleTwitterShare}
                    />
                  </Tooltip>
                  
                  <Tooltip label="Share on Facebook">
                    <IconButton
                      aria-label="Share on Facebook"
                      icon={<FaFacebook />}
                      colorScheme="facebook"
                      onClick={handleFacebookShare}
                    />
                  </Tooltip>
                  
                  <Tooltip label="Share via Email">
                    <IconButton
                      aria-label="Share via Email"
                      icon={<FaEnvelope />}
                      colorScheme="red"
                      onClick={handleEmailShare}
                    />
                  </Tooltip>
                  
                  <Tooltip label="Show QR Code">
                    <IconButton
                      aria-label="Show QR Code"
                      icon={<FaQrcode />}
                      colorScheme="purple"
                      onClick={() => setShowQR(true)}
                    />
                  </Tooltip>
                </SimpleGrid>
                
                <HStack justifyContent="center">
                  <Text fontSize="sm" color="gray.500">
                    Share your memory with the world!
                  </Text>
                </HStack>
              </>
            ) : (
              <Box textAlign="center">
                <QRCode
                  value={shareUrl}
                  size={200}
                  level="H"
                  includeMargin
                  renderAs="canvas"
                />
                <Button
                  mt={4}
                  leftIcon={<FaLink />}
                  onClick={() => setShowQR(false)}
                  size="sm"
                >
                  Back to Share Options
                </Button>
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ShareMemory;