import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { WalletMultiButton } from '../components/WalletConnect';
import { MemoryQuality, MemoryType } from '../components/MemoryCard';
import { 
  uploadFileToIPFS, 
  uploadMemoryMetadataToIPFS, 
  generateNeuralFingerprint,
  MemoryMetadata 
} from '../utils/ipfsUtils';
import { MintService } from '../services/mintService';
import { toast } from 'react-hot-toast';

const MintMemory = () => {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  
  // State for form fields
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDescription, setMemoryDescription] = useState('');
  const [memoryType, setMemoryType] = useState<MemoryType>('cognitive');
  const [memoryQuality, setMemoryQuality] = useState<MemoryQuality>('common');
  const [brainRegion, setBrainRegion] = useState('');
  const [emotionalValence, setEmotionalValence] = useState<number>(0);
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(0);
  const [neuralDataFile, setNeuralDataFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mintProgress, setMintProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  
  // State for progress tracking
  const [currentStep, setCurrentStep] = useState<
    'form' | 'uploading' | 'processing' | 'minting' | 'complete'
  >('form');
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setPreviewImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle neural data file selection
  const handleNeuralDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNeuralDataFile(file);
    }
  };
  
  // Update overall progress
  useEffect(() => {
    // Calculate overall progress based on current step
    if (currentStep === 'form') {
      setOverallProgress(0);
    } else if (currentStep === 'uploading') {
      setOverallProgress(uploadProgress * 0.4); // Uploading is 40% of the process
    } else if (currentStep === 'processing') {
      setOverallProgress(40 + mintProgress * 0.2); // Processing is 20% of the process
    } else if (currentStep === 'minting') {
      setOverallProgress(60 + mintProgress * 0.4); // Minting is 40% of the process
    } else if (currentStep === 'complete') {
      setOverallProgress(100);
    }
  }, [uploadProgress, mintProgress, currentStep]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!neuralDataFile || !imageFile) {
      toast.error('[Chinese UI text] 请上传神经数据和图像文件');
      return;
    }
    
    setIsMinting(true);
    setCurrentStep('uploading');
    
    try {
      // 1. 上传图像到IPFS
      setUploadProgress(0);
      const imageIpfsPath = await uploadFileToIPFS(imageFile, (progress) => {
        setUploadProgress(progress * 0.5); // [Chinese comment] 图像上传占总上传的50%
      });
      
      // 2. 读取神经数据文件并生成神经指纹
      const neuralDataBuffer = await readFileAsArrayBuffer(neuralDataFile);
      const neuralSignature = await generateNeuralFingerprint(neuralDataBuffer);
      
      // 3. 创建元数据对象
      const metadata: MemoryMetadata = {
        name: memoryTitle,
        description: memoryDescription,
        image: imageIpfsPath,
        attributes: [
          { trait_type: 'Memory Type', value: memoryType },
          { trait_type: 'Quality', value: memoryQuality },
          { trait_type: 'Brain Region', value: brainRegion },
          { trait_type: 'Emotional Valence', value: emotionalValence },
          { trait_type: 'Cognitive Load', value: cognitiveLoad }
        ],
        brainRegion,
        emotionalValence,
        cognitiveLoad,
        memoryType,
        quality: memoryQuality,
        neuralSignature: neuralSignature,
        timestamp: Date.now(),
        creator: publicKey.toString()
      };
      
      // 4. 上传元数据到IPFS
      const metadataIpfsPath = await uploadMemoryMetadataToIPFS(metadata, (progress) => {
        setUploadProgress(50 + progress * 0.5); // [Chinese comment] 元数据上传占总上传的50%
      });
      
      // 5. 进入处理阶段
      setCurrentStep('processing');
      setMintProgress(0);
      
      // [Chinese comment] 初始化Mint服务
      const mintService = new MintService();
      
      // 6. 进入Mint阶段
      setCurrentStep('minting');
      setMintProgress(0);
      
      // 7. Mint记忆NFT
      const mintResult = await mintService.mintMemoryNFT(
        publicKey,
        metadataIpfsPath,
        {
          neuralSignature,
          memoryType,
          quality: memoryQuality,
          transferable: true
        },
        (progress) =>[Chinese UI text]  {
          setMintProgress(progress);
        }
      );
      
      // 8. Mint完成
      setCurrentStep('complete');
      
      // 9. 显示成功消息并跳转到详情页
      toast.success('[Chinese UI text] 记忆NFTMint成功！');
      router.push(`/memory/${mintResult.mint.toString()}`);
    } catch (error) {
      console.error('Mint记忆时出错:', error);
      toast.error('[Chinese UI text] Mint记忆失败。请重试。');
    } finally {
      setIsMinting(false);
    }
  };
  
  // [Chinese comment] 辅助函数：将File对象读取为ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && event.target.result instanceof ArrayBuffer) {
          resolve(event.target.result);
        } else {
          reject(new Error('无法读取文件'));
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };
  
  // [Chinese comment] 渲染进度条
  const renderProgressBar = useCallback(() =>[Chinese UI text]  {
    const steps = [
      { name: '填写表单', status: currentStep !== 'form' ? 'complete' : 'current' },
      { name: '上传到IPFS', status: currentStep === 'uploading' ? 'current' : currentStep === 'form' ? 'upcoming' : 'complete' },
      { name: '处理数据', status: currentStep === 'processing' ? 'current' : ['form', 'uploading'].includes(currentStep) ? 'upcoming' : 'complete' },
      { name: 'MintNFT', status: currentStep === 'minting' ? 'current' : ['form', 'uploading', 'processing'].includes(currentStep) ? 'upcoming' : 'complete' },
      { name: '完成', status: currentStep === 'complete' ? 'current' : 'upcoming' }
    ];
    
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className={`text-sm ${
                step.status === 'complete' ? 'text-green-400' : 
                step.status === 'current' ? 'text-blue-400' : 
                'text-gray-500'
              }`}
            >
              {step.name}
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: '0%' }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-right text-sm text-gray-400 mt-1">
          {Math.round(overallProgress)}%
        </div>
      </div>
    );
  }, [currentStep, overallProgress]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>[Chinese UI text] Mint记忆NFT | NeuraMint</title>
        <meta name="description" content="在Solana区块链上创建和Mint你的神经记忆NFT" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">[Chinese UI text] Mint记忆NFT</h1>
        
        {isMinting && renderProgressBar()}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left column - Preview */}
          <div>
            <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
              <div className="aspect-square w-full relative flex items-center justify-center">
                {previewImage ? (
                  <img 
                    src={previewImage}
                    alt="Memory preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-center p-12">
                    <div className="text-6xl mb-4">🧠</div>
                    <p className="text-gray-400">[Chinese UI text] 神经数据预览将显示在这里</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">[Chinese UI text] 什么是记忆NFT？</h3>
              <p className="text-gray-300 mb-4">[Chinese UI text] 
                记忆NFT是代表从你的大脑中捕获的神经模式的独特数字资产。
                使用先进的BCI技术，NeuraMint将这些模式转换为Solana区块链上可收藏、可交易的NFT。
              </p>
              <p className="text-gray-300">[Chinese UI text] 
                每个记忆NFT都具有独特的属性，包括脑区、情感效价、
                认知负荷和Validate其真实性的神经签名。
              </p>
            </div>
          </div>
          
          {/* Right column - Form */}
          <div>
            <div className="bg-gray-800 p-6 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">[Chinese UI text] 记忆详情</h3>
                <WalletMultiButton />
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-400 mb-2">[Chinese UI text] 记忆标题</label>
                    <input
                      type="text"
                      value={memoryTitle}
                      onChange={(e) => setMemoryTitle(e.target.value)}
                      required
                      disabled={isMinting}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      placeholder="例如：创意突破"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">[Chinese UI text] 描述</label>
                    <textarea
                      value={memoryDescription}
                      onChange={(e) => setMemoryDescription(e.target.value)}
                      required
                      disabled={isMinting}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 h-24"
                      placeholder="描述这段记忆代表什么..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-2">[Chinese UI text] 记忆类型</label>
                      <select
                        value={memoryType}
                        onChange={(e) => setMemoryType(e.target.value as MemoryType)}
                        disabled={isMinting}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      >
                        <option value="cognitive">[Chinese UI text] 认知型 🧠</option>
                        <option value="emotional">[Chinese UI text] 情感型 ❤️</option>
                        <option value="cultural">[Chinese UI text] 文化型 🏛️</option>
                        <option value="therapeutic">[Chinese UI text] 治疗型 🏥</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 mb-2">[Chinese UI text] 品质等级</label>
                      <select
                        value={memoryQuality}
                        onChange={(e) => setMemoryQuality(e.target.value as MemoryQuality)}
                        disabled={isMinting}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      >
                        <option value="common">[Chinese UI text] 普通</option>
                        <option value="fine">[Chinese UI text] 精良</option>
                        <option value="excellent">[Chinese UI text] 卓越</option>
                        <option value="legendary">[Chinese UI text] 传奇</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-2">[Chinese UI text] 脑区</label>
                      <input
                        type="text"
                        value={brainRegion}
                        onChange={(e) => setBrainRegion(e.target.value)}
                        required
                        disabled={isMinting}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="例如：前额叶皮质"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 mb-2">[Chinese UI text] 情感效价 (-10~10)</label>
                      <input
                        type="number"
                        min="-10"
                        max="10"
                        value={emotionalValence}
                        onChange={(e) => setEmotionalValence(parseInt(e.target.value))}
                        required
                        disabled={isMinting}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="例如：5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-400 mb-2">[Chinese UI text] 认知负荷 (0~10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={cognitiveLoad}
                        onChange={(e) => setCognitiveLoad(parseInt(e.target.value))}
                        required
                        disabled={isMinting}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="例如：7"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">[Chinese UI text] 上传记忆图像</label>
                    <div className="w-full bg-gray-700 border border-dashed border-gray-500 rounded-lg px-4 py-8 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isMinting}
                        className="hidden"
                        id="memory-image"
                      />
                      <label 
                        htmlFor="memory-image"
                        className="cursor-pointer inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                      >[Chinese UI text] 
                        选择图像文件
                      </label>
                      {imageFile && (
                        <p className="mt-2 text-gray-300">[Chinese UI text] 已选择: {imageFile.name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 mb-2">[Chinese UI text] 上传神经数据文件</label>
                    <div className="w-full bg-gray-700 border border-dashed border-gray-500 rounded-lg px-4 py-8 text-center">
                      <input
                        type="file"
                        accept=".neura,.eeg,.bin,.dat"
                        onChange={handleNeuralDataChange}
                        disabled={isMinting}
                        className="hidden"
                        id="neural-data"
                      />
                      <label 
                        htmlFor="neural-data"
                        className="cursor-pointer inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                      >[Chinese UI text] 
                        选择神经数据文件
                      </label>
                      {neuralDataFile && (
                        <p className="mt-2 text-gray-300">[Chinese UI text] 已选择: {neuralDataFile.name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isMinting || !connected}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isMinting ? 'Mint中...' : 'Mint记忆NFT'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintMemory;
