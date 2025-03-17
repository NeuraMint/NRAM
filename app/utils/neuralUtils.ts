import { MemoryQuality, MemoryType } from '../components/MemoryCard';

// [Chinese comment] 情感价值枚举
export enum EmotionalValence {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
  MIXED = 'Mixed'
}

// [Chinese comment] 认知负荷枚举
export enum CognitiveLoad {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  VERY_HIGH = 'Very High'
}

// [Chinese comment] 脑区枚举
export enum BrainRegion {
  PREFRONTAL_CORTEX = 'Prefrontal Cortex',
  HIPPOCAMPUS = 'Hippocampus',
  AMYGDALA = 'Amygdala',
  VISUAL_CORTEX = 'Visual Cortex',
  AUDITORY_CORTEX = 'Auditory Cortex',
  SOMATOSENSORY_CORTEX = 'Somatosensory Cortex',
  WHOLE_BRAIN = 'Whole Brain',
  LIMBIC_SYSTEM = 'Limbic System',
  TEMPORAL_LOBE = 'Temporal Lobe',
  PARIETAL_LOBE = 'Parietal Lobe',
  OCCIPITAL_LOBE = 'Occipital Lobe',
  FRONTAL_LOBE = 'Frontal Lobe',
  CEREBELLUM = 'Cerebellum',
  BASAL_GANGLIA = 'Basal Ganglia',
  THALAMUS = 'Thalamus',
  BRAINSTEM = 'Brainstem'
}

// [Chinese comment] 神经数据分析结果接口
export interface NeuralAnalysisResult {
  quality: MemoryQuality;
  type: MemoryType;
  brainRegion: BrainRegion;
  emotionalValence: EmotionalValence;
  cognitiveLoad: CognitiveLoad;
  neuralFingerprint: string;
  confidenceScore: number;
  timestamp: number;
}

/**
 * 神经数据分析函数（模拟）
 * 在实际应用中，这将是一个复杂的神经网络模型，
 * 可能在后端服务器上运行，而不是在浏览器中。
 * 
 * @param data 原始神经数据
 * @returns 分析结果
 */
export const analyzeNeuralData = async (data: ArrayBuffer): Promise<NeuralAnalysisResult> => {
  // [Chinese comment] 模拟数据处理延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // [Chinese comment] 从数据创建模拟的神经指纹
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const neuralFingerprint = '0x' + hashArray.map(b =>  b.toString(16).padStart(2, '0')).join('');
  
  // [Chinese comment] 根据神经指纹的特定位生成记忆质量
  // [Chinese comment] 这只是一个模拟，实际应用会使用更复杂的算法
  const qualityDeterminator = hashArray[0] % 100;
  let quality: MemoryQuality;
  
  if (qualityDeterminator < 50) {
    quality = 'common';
  } else if (qualityDeterminator < 80) {
    quality = 'fine';
  } else if (qualityDeterminator < 95) {
    quality = 'excellent';
  } else {
    quality = 'legendary';
  }
  
  // [Chinese comment] 类似地，根据神经指纹模拟其他属性
  const typeDeterminator = hashArray[1] % 4;
  const types: MemoryType[] = ['cognitive', 'emotional', 'cultural', 'therapeutic'];
  const type = types[typeDeterminator];
  
  const regionDeterminator = hashArray[2] % Object.keys(BrainRegion).length;
  const regions = Object.values(BrainRegion);
  const brainRegion = regions[regionDeterminator];
  
  const valenceDeterminator = hashArray[3] % Object.keys(EmotionalValence).length;
  const valences = Object.values(EmotionalValence);
  const emotionalValence = valences[valenceDeterminator];
  
  const loadDeterminator = hashArray[4] % Object.keys(CognitiveLoad).length;
  const loads = Object.values(CognitiveLoad);
  const cognitiveLoad = loads[loadDeterminator];
  
  // [Chinese comment] 计算一个随机的置信度分数(0.5-1.0)
  const confidenceScore = 0.5 + ((hashArray[5] % 50) / 100);
  
  return {
    quality,
    type,
    brainRegion,
    emotionalValence,
    cognitiveLoad,
    neuralFingerprint,
    confidenceScore,
    timestamp: Date.now()
  };
};

/**
 * 基于分析结果生成Memory name
 * @param result 神经分析结果
 * @returns 生成的Memory name
 */
export const generateMemoryName = (result: NeuralAnalysisResult): string => {
  const typeAdjectives = {
    cognitive: ['Thought', 'Insight', 'Reasoning', 'Problem-Solving', 'Learning'],
    emotional: ['Emotional', 'Feeling', 'Sentiment', 'Mood', 'Affect'],
    cultural: ['Cultural', 'Tradition', 'Heritage', 'Artistic', 'Social'],
    therapeutic: ['Healing', 'Recovery', 'Therapeutic', 'Restorative', 'Calming']
  };
  
  const regionNouns = {
    [BrainRegion.PREFRONTAL_CORTEX]: ['Planning', 'Decision', 'Executive', 'Control', 'Judgment'],
    [BrainRegion.HIPPOCAMPUS]: ['Memory', 'Recall', 'Recollection', 'Navigation', 'Recognition'],
    [BrainRegion.AMYGDALA]: ['Fear', 'Emotion', 'Alertness', 'Response', 'Reaction'],
    [BrainRegion.VISUAL_CORTEX]: ['Vision', 'Sight', 'Imagery', 'Visualization', 'Perception'],
    [BrainRegion.AUDITORY_CORTEX]: ['Sound', 'Hearing', 'Melody', 'Rhythm', 'Harmony'],
    [BrainRegion.WHOLE_BRAIN]: ['Full', 'Complete', 'Holistic', 'Integrated', 'Comprehensive'],
    // [Chinese comment] 简化版本，可以扩展更多
    [BrainRegion.LIMBIC_SYSTEM]: ['Emotional', 'Mood', 'Motivational', 'Instinctual', 'Reward'],
    [BrainRegion.TEMPORAL_LOBE]: ['Language', 'Speech', 'Recognition', 'Processing', 'Understanding']
  };
  
  // [Chinese comment] 默认词组
  const defaultTypeAdjectives = ['Neural', 'Brain', 'Cognitive', 'Mental', 'Psychological'];
  const defaultRegionNouns = ['Pattern', 'Activity', 'Process', 'State', 'Function'];
  
  // [Chinese comment] 选择一个随机的形容词
  const typeAdjectiveList = typeAdjectives[result.type] || defaultTypeAdjectives;
  const typeAdjective = typeAdjectiveList[Math.floor(Math.random() * typeAdjectiveList.length)];
  
  // [Chinese comment] 选择一个随机的名词
  const regionNounList = regionNouns[result.brainRegion as keyof typeof regionNouns] || defaultRegionNouns;
  const regionNoun = regionNounList[Math.floor(Math.random() * regionNounList.length)];
  
  // [Chinese comment] 组合形成Memory name
  return `${typeAdjective} ${regionNoun}`;
};

/**
 * 计算记忆的基础价值（基于质量和类型）
 * @param quality 记忆质量
 * @param type 记忆类型
 * @returns 基础价值（NRAM代币）
 */
export const calculateMemoryBaseValue = (quality: MemoryQuality, type: MemoryType): number => {
  // [Chinese comment] 基于质量的价值映射
  const qualityValues = {
    common: 100,
    fine: 250,
    excellent: 1000,
    legendary: 5000
  };
  
  // [Chinese comment] 基于类型的乘数
  const typeMultipliers = {
    cognitive: 1.0,
    emotional: 1.2,
    cultural: 1.5,
    therapeutic: 2.0
  };
  
  // [Chinese comment] 计算并返回基础价值
  return qualityValues[quality] * typeMultipliers[type];
};

/**
 * 计算记忆稀有度（用于展示）
 * @param quality 记忆质量
 * @returns 稀有度百分比
 */
export const calculateMemoryRarity = (quality: MemoryQuality): number => {
  switch (quality) {
    case 'legendary':
      return 99.5; // [Chinese comment] 前0.5%
    case 'excellent':
      return 85; // [Chinese comment] 前15%
    case 'fine':
      return 50; // [Chinese comment] 前50%
    case 'common':
    default:
      return 10; // [Chinese comment] 前90%
  }
}; 