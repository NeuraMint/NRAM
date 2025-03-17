import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Image,
  Grid,
  GridItem,
  Badge,
  IconButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Select,
  Switch,
  HStack,
  VStack
} from '@chakra-ui/react';
import { FaPlus, FaEllipsisV, FaEdit, FaTrash, FaShare, FaEye, FaEyeSlash, FaLock, FaUnlock } from 'react-icons/fa';
import ShareMemory from './ShareMemory';

// Collection type definition
interface Collection {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  isPublic: boolean;
  memoryIds: string[];
  ownerAddress: string;
  createdAt: string;
  updatedAt: string;
}

// Memory type for display in collections
interface MemoryBrief {
  id: string;
  name: string;
  imageUrl: string;
  quality: number;
  memoryType: string;
}

interface MemoryCollectionProps {
  walletAddress?: string;
  initialCollections?: Collection[];
  userMemories?: MemoryBrief[];
  onCollectionCreate?: (collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCollectionUpdate?: (collection: Collection) => Promise<void>;
  onCollectionDelete?: (collectionId: string) => Promise<void>;
  onMemoryAddToCollection?: (memoryId: string, collectionId: string) => Promise<void>;
  onMemoryRemoveFromCollection?: (memoryId: string, collectionId: string) => Promise<void>;
}

const MemoryCollection: React.FC<MemoryCollectionProps> = ({
  walletAddress,
  initialCollections = [],
  userMemories = [],
  onCollectionCreate,
  onCollectionUpdate,
  onCollectionDelete,
  onMemoryAddToCollection,
  onMemoryRemoveFromCollection
}) => {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionMemories, setCollectionMemories] = useState<MemoryBrief[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [availableMemories, setAvailableMemories] = useState<MemoryBrief[]>([]);
  
  // New collection form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);
  
  // Memory selection state
  const [selectedMemoryId, setSelectedMemoryId] = useState<string>('');
  
  // Modal controls
  const { 
    isOpen: isCollectionModalOpen, 
    onOpen: onCollectionModalOpen, 
    onClose: onCollectionModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isMemoryModalOpen, 
    onOpen: onMemoryModalOpen, 
    onClose: onMemoryModalClose 
  } = useDisclosure();
  
  const toast = useToast();
  
  // Load collection memories when a collection is selected
  useEffect(() => {
    if (selectedCollection && userMemories.length > 0) {
      const memories = userMemories.filter(memory => 
        selectedCollection.memoryIds.includes(memory.id)
      );
      
      setCollectionMemories(memories);
      
      // Calculate available memories (not in this collection)
      const available = userMemories.filter(memory => 
        !selectedCollection.memoryIds.includes(memory.id)
      );
      
      setAvailableMemories(available);
    }
  }, [selectedCollection, userMemories]);
  
  // Handle creating a new collection
  const handleCreateCollection = async () => {
    if (!formName.trim()) {
      toast({
        title: "Collection name required",
        status: "error",
        duration: 3000,
      });
      return;
    }
    
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      
      const newCollection = {
        name: formName,
        description: formDescription,
        coverImageUrl: formCoverImage || '/images/default-collection.jpg',
        isPublic: formIsPublic,
        memoryIds: [],
        ownerAddress: walletAddress
      };
      
      // Call parent handler if provided
      if (onCollectionCreate) {
        await onCollectionCreate(newCollection);
      }
      
      // Generate a temporary ID for UI
      const tempCollection = {
        ...newCollection,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCollections([...collections, tempCollection]);
      
      toast({
        title: "Collection created!",
        status: "success",
        duration: 3000,
      });
      
      // Reset form
      setFormName('');
      setFormDescription('');
      setFormCoverImage('');
      setFormIsPublic(true);
      
      onCollectionModalClose();
    } catch (error) {
      toast({
        title: "Failed to create collection",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };
  
  // Handle updating an existing collection
  const handleUpdateCollection = async () => {
    if (!selectedCollection) return;
    
    try {
      const updatedCollection = {
        ...selectedCollection,
        name: formName,
        description: formDescription,
        coverImageUrl: formCoverImage,
        isPublic: formIsPublic,
        updatedAt: new Date().toISOString()
      };
      
      // Call parent handler if provided
      if (onCollectionUpdate) {
        await onCollectionUpdate(updatedCollection);
      }
      
      // Update local state
      setCollections(collections.map(c => 
        c.id === updatedCollection.id ? updatedCollection : c
      ));
      
      setSelectedCollection(updatedCollection);
      
      toast({
        title: "Collection updated!",
        status: "success",
        duration: 3000,
      });
      
      setIsEditing(false);
      onCollectionModalClose();
    } catch (error) {
      toast({
        title: "Failed to update collection",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };
  
  // Handle deleting a collection
  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;
    
    try {
      // Call parent handler if provided
      if (onCollectionDelete) {
        await onCollectionDelete(selectedCollection.id);
      }
      
      // Update local state
      setCollections(collections.filter(c => c.id !== selectedCollection.id));
      setSelectedCollection(null);
      
      toast({
        title: "Collection deleted!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to delete collection",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };
  
  // Handle adding a memory to the collection
  const handleAddMemoryToCollection = async () => {
    if (!selectedCollection || !selectedMemoryId) {
      toast({
        title: "Please select a memory",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    
    try {
      // Call parent handler if provided
      if (onMemoryAddToCollection) {
        await onMemoryAddToCollection(selectedMemoryId, selectedCollection.id);
      }
      
      // Update local state
      const updatedCollection = {
        ...selectedCollection,
        memoryIds: [...selectedCollection.memoryIds, selectedMemoryId],
        updatedAt: new Date().toISOString()
      };
      
      setCollections(collections.map(c => 
        c.id === updatedCollection.id ? updatedCollection : c
      ));
      
      setSelectedCollection(updatedCollection);
      
      // Update collection memories
      const addedMemory = userMemories.find(m => m.id === selectedMemoryId);
      if (addedMemory) {
        setCollectionMemories([...collectionMemories, addedMemory]);
        setAvailableMemories(availableMemories.filter(m => m.id !== selectedMemoryId));
      }
      
      toast({
        title: "Memory added to collection!",
        status: "success",
        duration: 3000,
      });
      
      setSelectedMemoryId('');
      onMemoryModalClose();
    } catch (error) {
      toast({
        title: "Failed to add memory",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };
  
  // Handle removing a memory from the collection
  const handleRemoveMemoryFromCollection = async (memoryId: string) => {
    if (!selectedCollection) return;
    
    try {
      // Call parent handler if provided
      if (onMemoryRemoveFromCollection) {
        await onMemoryRemoveFromCollection(memoryId, selectedCollection.id);
      }
      
      // Update local state
      const updatedCollection = {
        ...selectedCollection,
        memoryIds: selectedCollection.memoryIds.filter(id => id !== memoryId),
        updatedAt: new Date().toISOString()
      };
      
      setCollections(collections.map(c => 
        c.id === updatedCollection.id ? updatedCollection : c
      ));
      
      setSelectedCollection(updatedCollection);
      
      // Update collection memories
      const removedMemory = userMemories.find(m => m.id === memoryId);
      if (removedMemory) {
        setCollectionMemories(collectionMemories.filter(m => m.id !== memoryId));
        setAvailableMemories([...availableMemories, removedMemory]);
      }
      
      toast({
        title: "Memory removed from collection!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to remove memory",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };
  
  // Open the collection modal for editing
  const openEditModal = (collection: Collection) => {
    setFormName(collection.name);
    setFormDescription(collection.description);
    setFormCoverImage(collection.coverImageUrl);
    setFormIsPublic(collection.isPublic);
    setIsEditing(true);
    onCollectionModalOpen();
  };
  
  // Open the collection modal for creating
  const openCreateModal = () => {
    setFormName('');
    setFormDescription('');
    setFormCoverImage('');
    setFormIsPublic(true);
    setIsEditing(false);
    onCollectionModalOpen();
  };
  
  return (
    <Box>
      {/* Collections List View */}
      {!selectedCollection && (
        <>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="lg">My Collections</Heading>
            <Button 
              leftIcon={<FaPlus />} 
              colorScheme="blue" 
              onClick={openCreateModal}
            >
              New Collection
            </Button>
          </Flex>
          
          <Grid 
            templateColumns="repeat(auto-fill, minmax(250px, 1fr))" 
            gap={6}
          >
            {collections.map(collection => (
              <GridItem key={collection.id}>
                <Box
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                  transition="transform 0.3s"
                  _hover={{ transform: 'scale(1.02)' }}
                  onClick={() => setSelectedCollection(collection)}
                  cursor="pointer"
                >
                  <Image
                    src={collection.coverImageUrl}
                    alt={collection.name}
                    height="150px"
                    width="100%"
                    objectFit="cover"
                  />
                  <Box p={4}>
                    <Flex justify="space-between" align="center">
                      <Heading size="md" noOfLines={1}>{collection.name}</Heading>
                      {!collection.isPublic && (
                        <IconButton
                          icon={<FaLock />}
                          aria-label="Private collection"
                          size="sm"
                          variant="ghost"
                          onClick={e => {
                            e.stopPropagation();
                            // This could toggle visibility in a real app
                          }}
                        />
                      )}
                    </Flex>
                    <Text mt={2} fontSize="sm" color="gray.600" noOfLines={2}>
                      {collection.description || "No description"}
                    </Text>
                    <Flex mt={3} justify="space-between" align="center">
                      <Badge colorScheme="blue">
                        {collection.memoryIds.length} {collection.memoryIds.length === 1 ? 'Memory' : 'Memories'}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        Created {new Date(collection.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              </GridItem>
            ))}
          </Grid>
          
          {collections.length === 0 && (
            <Box 
              textAlign="center" 
              p={10} 
              borderWidth="1px" 
              borderRadius="lg" 
              borderStyle="dashed"
            >
              <Text mb={4}>You don't have any collections yet.</Text>
              <Button 
                leftIcon={<FaPlus />} 
                colorScheme="blue" 
                onClick={openCreateModal}
              >
                Create Your First Collection
              </Button>
            </Box>
          )}
        </>
      )}
      
      {/* Collection Detail View */}
      {selectedCollection && (
        <>
          <Flex justify="space-between" align="center" mb={6}>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCollection(null)}
            >
              ← Back to Collections
            </Button>
            
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisV />}
                variant="ghost"
                aria-label="Options"
              />
              <MenuList>
                <MenuItem 
                  icon={<FaEdit />} 
                  onClick={() => openEditModal(selectedCollection)}
                >
                  Edit Collection
                </MenuItem>
                <MenuItem 
                  icon={selectedCollection.isPublic ? <FaEyeSlash /> : <FaEye />}
                  onClick={() => {
                    // Toggle visibility
                    const updated = {
                      ...selectedCollection,
                      isPublic: !selectedCollection.isPublic
                    };
                    setSelectedCollection(updated);
                    if (onCollectionUpdate) {
                      onCollectionUpdate(updated).catch(err => {
                        console.error(err);
                        // Revert on failure
                        setSelectedCollection(selectedCollection);
                      });
                    }
                  }}
                >
                  {selectedCollection.isPublic ? "Make Private" : "Make Public"}
                </MenuItem>
                <MenuItem icon={<FaShare />}>Share Collection</MenuItem>
                <MenuDivider />
                <MenuItem 
                  icon={<FaTrash />} 
                  color="red.500"
                  onClick={handleDeleteCollection}
                >
                  Delete Collection
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          
          <Box 
            mb={6} 
            position="relative" 
            height="200px" 
            borderRadius="lg" 
            overflow="hidden"
          >
            <Image
              src={selectedCollection.coverImageUrl}
              alt={selectedCollection.name}
              width="100%"
              height="100%"
              objectFit="cover"
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              p={4}
              background="linear-gradient(to top, rgba(0,0,0,0.7), transparent)"
              color="white"
            >
              <Heading size="lg">{selectedCollection.name}</Heading>
              <Flex mt={1} align="center">
                <Badge 
                  colorScheme={selectedCollection.isPublic ? "green" : "purple"}
                  mr={2}
                >
                  {selectedCollection.isPublic ? "Public" : "Private"}
                </Badge>
                <Text fontSize="sm">
                  {selectedCollection.memoryIds.length} {selectedCollection.memoryIds.length === 1 ? 'Memory' : 'Memories'}
                </Text>
              </Flex>
            </Box>
          </Box>
          
          <Text mb={4}>{selectedCollection.description}</Text>
          
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Memories in This Collection</Heading>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              size="sm"
              isDisabled={availableMemories.length === 0}
              onClick={() => {
                setIsAddingMemory(true);
                setSelectedMemoryId('');
                onMemoryModalOpen();
              }}
            >
              Add Memory
            </Button>
          </Flex>
          
          {collectionMemories.length > 0 ? (
            <Grid
              templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
              gap={4}
            >
              {collectionMemories.map(memory => (
                <GridItem key={memory.id}>
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="sm"
                  >
                    <Image
                      src={memory.imageUrl}
                      alt={memory.name}
                      height="120px"
                      width="100%"
                      objectFit="cover"
                    />
                    <Box p={3}>
                      <Heading size="sm" noOfLines={1}>{memory.name}</Heading>
                      <Flex mt={2} justify="space-between" align="center">
                        <Badge colorScheme={
                          memory.quality === 4 ? "purple" :
                          memory.quality === 3 ? "blue" :
                          memory.quality === 2 ? "green" : "gray"
                        }>
                          {memory.quality === 4 ? "Legendary" :
                           memory.quality === 3 ? "Excellent" :
                           memory.quality === 2 ? "Fine" : "Common"}
                        </Badge>
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="Remove from collection"
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleRemoveMemoryFromCollection(memory.id)}
                        />
                      </Flex>
                    </Box>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Box 
              textAlign="center" 
              p={6} 
              borderWidth="1px" 
              borderRadius="lg" 
              borderStyle="dashed"
            >
              <Text mb={3}>No memories in this collection yet.</Text>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                size="sm"
                isDisabled={availableMemories.length === 0}
                onClick={() => {
                  setIsAddingMemory(true);
                  setSelectedMemoryId('');
                  onMemoryModalOpen();
                }}
              >
                Add Memory
              </Button>
            </Box>
          )}
        </>
      )}
      
      {/* Collection Create/Edit Modal */}
      <Modal isOpen={isCollectionModalOpen} onClose={onCollectionModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Collection" : "Create New Collection"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Collection Name</FormLabel>
              <Input 
                value={formName} 
                onChange={(e) => setFormName(e.target.value)} 
                placeholder="My Cool Memories"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea 
                value={formDescription} 
                onChange={(e) => setFormDescription(e.target.value)} 
                placeholder="A collection of my favorite memories..."
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Cover Image URL</FormLabel>
              <Input 
                value={formCoverImage} 
                onChange={(e) => setFormCoverImage(e.target.value)} 
                placeholder="https://example.com/image.jpg"
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center" mb={4}>
              <FormLabel mb={0}>Make Collection Public</FormLabel>
              <Switch 
                isChecked={formIsPublic} 
                onChange={(e) => setFormIsPublic(e.target.checked)} 
                colorScheme="blue" 
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCollectionModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={isEditing ? handleUpdateCollection : handleCreateCollection}
            >
              {isEditing ? "Save Changes" : "Create Collection"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Add Memory Modal */}
      <Modal isOpen={isMemoryModalOpen} onClose={onMemoryModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Memory to Collection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {availableMemories.length > 0 ? (
              <FormControl>
                <FormLabel>Select Memory</FormLabel>
                <Select 
                  placeholder="Choose a memory" 
                  value={selectedMemoryId}
                  onChange={(e) => setSelectedMemoryId(e.target.value)}
                >
                  {availableMemories.map(memory => (
                    <option key={memory.id} value={memory.id}>
                      {memory.name} ({memory.memoryType})
                    </option>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Text>You don't have any memories available to add.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onMemoryModalClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleAddMemoryToCollection}
              isDisabled={!selectedMemoryId || availableMemories.length === 0}
            >
              Add to Collection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MemoryCollection; 