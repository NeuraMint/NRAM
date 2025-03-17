import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// [Chinese comment] 功能卡片接口
interface FeatureCard {
  title: string;
  description: string;
  icon: string;
}

// [Chinese comment] 特色功能
const features: FeatureCard[] = [
  {
    title: 'Mint记忆',
    description: '将您的记忆永久保存在区块链上，创建独特的NFT资产',
    icon: '🧠'
  },
  {
    title: 'Validate记忆',
    description: '成为Validate者，评估记忆的质量并获得代币Rewards',
    icon: '✅'
  },
  {
    title: '交易记忆',
    description: '在Marketplace上买卖记忆NFT，建立您的收藏',
    icon: '💱'
  },
  {
    title: '探索记忆',
    description: '浏览不同类型和质量的记忆，发现独特的内容',
    icon: '🔍'
  }
];

const HomePage: NextPage = () => {
  const { connected } = useWallet();
  
  return (
    <>
      <Head>
        <title> NeuraMint - 记忆NFT平台</title>
        <meta name="description" content="在Solana上Mint、Validate、交易和收集记忆NFT的平台" />
      </Head>

      {/* 英雄区域 */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6"> 
                将记忆Mint为
                <span className="text-yellow-300"> NFT</span>
              </h1>
              <p className="text-xl mb-8 text-blue-100"> 
                NeuraMint让您能够将珍贵的记忆永久保存在区块链上，进行Validate、交易和收藏。
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {connected ? (
                  <Link href="/create-memory">
                    <a className="btn btn-primary">Create Memory</a>
                  </Link>
                ) : (
                  <WalletMultiButton />
                )}
                <Link href="/market">
                  <a className="btn btn-secondary"> 浏览Marketplace</a>
                </Link>
              </div>
            </div>
            
            <div className="relative h-64 md:h-96">
              <div className="relative z-10 bg-white p-4 rounded-lg shadow-xl transform rotate-3 w-3/4 h-3/4 mx-auto">
                <div className="h-full w-full relative overflow-hidden rounded">
                  <Image
                    src="/images/sample-memory.jpg"
                    alt="记忆示例"
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                    priority
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-bold"> 
                  稀有记忆
                </div>
              </div>
              <div className="absolute z-0 top-10 left-10 bg-blue-800 w-3/4 h-3/4 rounded-lg transform -rotate-6"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 如何工作 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4"> 如何工作</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto"> 
              NeuraMint平台通过区块链技术将记忆转化为独特的NFT资产，为您的珍贵回忆赋予真正的价值
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-start space-y-8 md:space-y-0 md:space-x-8">
            <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/3">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3"> 上传记忆</h3>
              <p className="text-gray-600"> 
                连接您的钱包，上传图像和描述，提供神经指纹数据，创建独特的记忆NFT
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/3">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3"> 获得Validate</h3>
              <p className="text-gray-600"> 
                Validate者评估记忆的质量和真实性，确保平台上的内容符合Community标准
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/3">
              <div className="bg-blue-100 text-blue-700 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3"> 交易与收藏</h3>
              <p className="text-gray-600"> 
                将您的记忆上架出售，或收藏其他人的记忆，建立独特的数字记忆库
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 特色功能 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4"> 平台特色</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto"> 
              探索NeuraMint的核心功能，开始您的记忆NFT之旅
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 成为Validate者 */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4"> 成为Validate者</h2>
            <p className="text-xl max-w-3xl mx-auto"> 
              通过质押代币成为平台Validate者，评估记忆质量，维护Community标准，同时获得Rewards
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="bg-white text-gray-800 rounded-lg shadow-md p-6 w-full md:w-1/3">
              <h3 className="text-xl font-semibold mb-3">Validator特权</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 
                  评估记忆并获得代币Rewards
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 
                  获得独家Validate者徽章和头像
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 
                  参与平台治理投票
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-green-500">✓</span> 
                  获得优先购买稀有记忆NFT的权限
                </li>
              </ul>
              
              <div className="mt-6">
                <Link href="/validator-registration">
                  <a className="btn btn-primary w-full"> 立即注册</a>
                </Link>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="bg-indigo-800 bg-opacity-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3"> Validate流程</h3>
                <p className="mb-4"> 
                  Validate者通过质押SOL代币获得Validate权限，评估记忆的质量、真实性和内容。高质量的Validate工作会获得Rewards，而低质量的Validate可能导致质押减少。
                </p>
                <p> 
                  成为Validate者需要最低10 SOL的质押，您随时可以解除质押，但需要完成所有进行中的Validate任务。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 开始使用 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8"> 准备好开始您的记忆NFT之旅了吗？</h2>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {connected ? (
              <Link href="/create-memory">
                <a className="btn btn-primary"> 创建第一个记忆</a>
              </Link>
            ) : (
              <WalletMultiButton />
            )}
            <Link href="/market">
              <a className="btn btn-secondary"> 探索记忆Marketplace</a>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage; 