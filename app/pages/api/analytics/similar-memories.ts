import { NextApiRequest, NextApiResponse } from 'next';

type Memory = {
  id: string;
  name: string;
  memoryType: string;
  neuralFingerprint: number[];
  brainRegion: string;
  quality: number;
  imageUrl: string;
  price?: number;
  isListed?: boolean;
};

// Sample memory database (in a real app, this would come from a database)
const sampleMemories: Memory[] = [
  {
    id: 'mem_001',
    name: 'First Beach Visit',
    memoryType: 'Emotional',
    neuralFingerprint: [0.3, 0.7, 0.1, 0.9, 0.5],
    brainRegion: 'Hippocampus',
    quality: 3,
    imageUrl: '/images/memories/beach.jpg'
  },
  {
    id: 'mem_002',
    name: 'Learning to Code',
    memoryType: 'Cognitive',
    neuralFingerprint: [0.8, 0.2, 0.6, 0.3, 0.7],
    brainRegion: 'Prefrontal Cortex',
    quality: 4,
    imageUrl: '/images/memories/coding.jpg'
  },
  {
    id: 'mem_003',
    name: 'Childhood Birthday',
    memoryType: 'Emotional',
    neuralFingerprint: [0.4, 0.6, 0.2, 0.8, 0.4],
    brainRegion: 'Hippocampus',
    quality: 2,
    imageUrl: '/images/memories/birthday.jpg'
  },
  {
    id: 'mem_004',
    name: 'Solving a Puzzle',
    memoryType: 'Cognitive',
    neuralFingerprint: [0.9, 0.1, 0.7, 0.2, 0.6],
    brainRegion: 'Prefrontal Cortex',
    quality: 3,
    imageUrl: '/images/memories/puzzle.jpg'
  },
  {
    id: 'mem_005',
    name: 'Family Reunion',
    memoryType: 'Cultural',
    neuralFingerprint: [0.5, 0.5, 0.5, 0.5, 0.5],
    brainRegion: 'Amygdala',
    quality: 4,
    imageUrl: '/images/memories/family.jpg'
  },
  {
    id: 'mem_006',
    name: 'Meditation Session',
    memoryType: 'Therapeutic',
    neuralFingerprint: [0.1, 0.9, 0.3, 0.7, 0.2],
    brainRegion: 'Insular Cortex',
    quality: 3,
    imageUrl: '/images/memories/meditation.jpg'
  },
  {
    id: 'mem_007',
    name: 'Concert Experience',
    memoryType: 'Cultural',
    neuralFingerprint: [0.6, 0.4, 0.8, 0.2, 0.9],
    brainRegion: 'Auditory Cortex',
    quality: 4,
    imageUrl: '/images/memories/concert.jpg'
  }
];

/**
 * Calculate cosine similarity between two neural fingerprints
 */
const calculateSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Find similar memories based on neural fingerprint and other factors
 */
const findSimilarMemories = (
  memoryId: string, 
  limit: number = 5
): { memories: Memory[], similarityScores: Record<string, number> } => {
  const targetMemory = sampleMemories.find(m => m.id === memoryId);
  
  if (!targetMemory) {
    throw new Error('Memory not found');
  }
  
  const similarityScores: Record<string, number> = {};
  
  // Calculate similarity scores for all memories
  sampleMemories.forEach(memory => {
    if (memory.id !== memoryId) {
      // Neural fingerprint similarity (60% weight)
      const neuralSimilarity = calculateSimilarity(
        targetMemory.neuralFingerprint, 
        memory.neuralFingerprint
      ) * 0.6;
      
      // Brain region matching (20% weight)
      const regionSimilarity = 
        memory.brainRegion === targetMemory.brainRegion ? 0.2 : 0;
      
      // Memory type matching (20% weight)
      const typeSimilarity = 
        memory.memoryType === targetMemory.memoryType ? 0.2 : 0;
      
      // Combined similarity score
      similarityScores[memory.id] = neuralSimilarity + regionSimilarity + typeSimilarity;
    }
  });
  
  // Sort memories by similarity score and take the top 'limit'
  const sortedMemories = sampleMemories
    .filter(memory => memory.id !== memoryId)
    .sort((a, b) => similarityScores[b.id] - similarityScores[a.id])
    .slice(0, limit);
  
  return { 
    memories: sortedMemories,
    similarityScores: Object.fromEntries(
      sortedMemories.map(m => [m.id, parseFloat(similarityScores[m.id].toFixed(2))])
    )
  };
};

/**
 * API handler for finding similar memories
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, limit } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Memory ID is required' });
    }
    
    const parsedLimit = limit ? parseInt(limit as string, 10) : 5;
    
    const { memories, similarityScores } = findSimilarMemories(id, parsedLimit);
    
    res.status(200).json({
      source_memory_id: id,
      similar_memories: memories.map(memory => ({
        ...memory,
        similarity_score: similarityScores[memory.id]
      }))
    });
  } catch (error: any) {
    console.error('Error finding similar memories:', error);
    
    if (error.message === 'Memory not found') {
      return res.status(404).json({ error: 'Memory not found' });
    }
    
    res.status(500).json({ error: 'Failed to find similar memories' });
  }
} 