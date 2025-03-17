import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';
import { Toaster, toast } from 'react-hot-toast';
import { ValidationService, ValidationRequest } from '../services/validationService';

// [Chinese comment] Validate质量选项
const VALIDATION_QUALITY_OPTIONS = [
  { value: 100, label: '优质 (100分)', description: '高度真实和准确的记忆' },
  { value: 80, label: '良好 (80分)', description: '基本真实，有少量细节偏差' },
  { value: 60, label: '一般 (60分)', description: '主要元素真实，但有较多偏差' },
  { value: 40, label: '较差 (40分)', description: '真实性存疑，有明显虚构成分' },
  { value: 20, label: '劣质 (20分)', description: '大部分内容似乎是虚构的' },
  { value: 0, label: '无效 (0分)', description: '完全不符合记忆NFT标准或恶意submitted' },
];

const SubmitValidation: React.FC = () =>  {
  const router = useRouter();
  const { memoryId } = router.query;
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  
  // [Chinese comment] 表单状态
  const [memoryData, setMemoryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationScore, setValidationScore] = useState<number>(80);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [isValidator, setIsValidator] = useState<boolean>(false);
  
  // [Chinese comment] ValidateService instances
  const validationService = new ValidationService();
  
  // [Chinese comment] 加载记忆数据和Validate者状态
  useEffect(() => {
    const loadData = async () => {
      if (!memoryId) return;
      
      setLoading(true);
      try {
        // [Chinese comment] 这里应该从API获取记忆数据
        // [Chinese comment] 模拟数据
        const mockMemoryData = {
          id: memoryId as string,
          name: '巴黎旅行记忆',
          description: '我第一次去巴黎时的埃菲尔铁塔记忆，那时正值夏季，天气晴朗。',
          imageUrl: '/images/memories/paris.jpg',
          creator: 'Creator123',
          createDate: new Date('2023-06-15'),
          neuralFingerprint: 'nfp_12345abcde',
          type: '旅行',
          intensity: 85,
        };
        
        setMemoryData(mockMemoryData);
        
        // Check if user is a validator
        if (connected && publicKey) {
          const isUserValidator = await validationService.isValidator(publicKey);
          setIsValidator(isUserValidator);
        }
      } catch (error) {
        console.error('加载记忆数据失败:', error);
        toast.error(' 无法加载记忆数据');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [memoryId, connected, publicKey]);
  
  // Submit validation
  const handleSubmitValidation = async () =>  {
    if (!connected || !publicKey || !memoryData) {
      toast.error('Please connect your wallet first并确保记忆数据已加载');
      return;
    }
    
    if (!isValidator) {
      toast.error('You不是Validate者，请先Register as a validator');
      router.push('/validator-registration');
      return;
    }
    
    setSubmitting(true);
    try {
      const validationRequest: ValidationRequest = {
        memoryMint: new PublicKey(memoryData.id),
        validationScore,
        isValid,
        comment,
      };
      
      // Submit validation
      const toastId = toast.loading('Submitting validation...');
      await validationService.submitValidation(publicKey, validationRequest);
      
      toast.success(' Validatesubmitted成功!', { id: toastId });
      router.push('/validator-dashboard?tab=history');
    } catch (error) {
      console.error('Submit validation失败:', error);
      toast.error(' Validation submission failed, please try again');
    } finally {
      setSubmitting(false);
    }
  };
  
  // [Chinese comment] 如果记忆ID不存在，显示错误
  if (!memoryId && !loading) {
    return (
      <div className="container p-4 mx-auto">
        <div className="p-8 text-center bg-red-100 rounded-lg">
          <h2 className="text-xl font-bold text-red-800"> 缺少记忆ID</h2>
          <p className="mt-2 text-red-600"> 无法进行Validate，缺少有效的记忆ID参数</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
          > 
            返回
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Submit validation | NeuraMint</title>
        <meta name="description" content="Validate记忆的真实性和质量" />
      </Head>
      
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold">Submit validation</h1>
        
        {!connected ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
            <p className="mb-4 text-lg"> 请连接钱包以Submit validation</p>
            <WalletMultiButton />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : !isValidator ? (
          <div className="p-8 text-center bg-yellow-100 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-800">You不是Validate者</h2>
            <p className="mt-2 text-yellow-700"> 要Submit validation，您需要先注册成为NeuraMintValidate者</p>
            <button
              onClick={() => router.push('/validator-registration')}
              className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Register as a validator
            </button>
          </div>
        ) : memoryData ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* 记忆信息 */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-2xl font-bold">{memoryData.name}</h2>
              
              <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
                {memoryData.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image 
                      src={memoryData.imageUrl}
                      alt={memoryData.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <span className="text-gray-400"> 无图像</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold"> 描述</h3>
                <p className="mt-1 text-gray-700">{memoryData.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500"> 创建者</h3>
                  <p>{memoryData.creator}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500"> 创建日期</h3>
                  <p>{memoryData.createDate?.toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500">Memory Type</h3>
                  <p>{memoryData.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500"> 强度</h3>
                  <p>{memoryData.intensity}/100</p>
                </div>
              </div>
              
              <div className="mt-4 overflow-hidden rounded-md">
                <h3 className="text-sm font-semibold text-gray-500"> 神经指纹</h3>
                <div className="p-2 mt-1 font-mono text-xs bg-gray-100 break-all">
                  {memoryData.neuralFingerprint}
                </div>
              </div>
            </div>
            
            {/* Validate表单 */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-6 text-2xl font-bold"> Validate评估</h2>
              
              <div className="mb-6">
                <label className="block mb-2 text-lg font-medium"> 记忆质量评分</label>
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="20"
                    value={validationScore}
                    onChange={(e) => {
                      const score = parseInt(e.target.value);
                      setValidationScore(score);
                      setIsValid(score >= 60); // 60分以上视为有效
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span> 无效</span>
                    <span> 劣质</span>
                    <span> 较差</span>
                    <span> 一般</span>
                    <span> 良好</span>
                    <span> 优质</span>
                  </div>
                </div>
                
                <div className="p-4 mb-4 bg-gray-100 rounded-lg">
                  <p className="font-medium">
                    {VALIDATION_QUALITY_OPTIONS.find(option => option.value === validationScore)?.label}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {VALIDATION_QUALITY_OPTIONS.find(option => option.value === validationScore)?.description}
                  </p>
                </div>
                
                <div className="px-4 py-3 mb-4 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800"> 
                    您的评分：<span className="font-bold">{validationScore}</span>/100
                  </p>
                  <p className="text-sm text-blue-800"> 
                    Validate结果：
                    {isValid ? (
                      <span className="font-bold text-green-600"> 有效记忆</span>
                    ) : (
                      <span className="font-bold text-red-600"> 无效记忆</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 text-lg font-medium" htmlFor="comment"> 
                  Validate评论 (可选)
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="请提供您对此记忆的评价、观察或建议..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={submitting}
                > 
                  返回
                </button>
                <button
                  onClick={handleSubmitValidation}
                  disabled={submitting}
                  className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'submitted中...' : 'Submit validation'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-red-100 rounded-lg">
            <h2 className="text-xl font-bold text-red-800"> 记忆数据加载失败</h2>
            <p className="mt-2 text-red-600"> 无法获取记忆数据，请稍后重试</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
            > 
              返回
            </button>
          </div>
        )}
      </div>
      
      <Toaster position="bottom-right" />
    </>
  );
};

export default SubmitValidation; 