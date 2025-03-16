import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';

const About = () =>[Chinese UI text]  {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const teamMembers = [
    {
      name: '李明',
      role: '创始人 & CEO',
      bio: '脑机接口技术专家，拥有10年神经科学研究经验。曾在多家顶尖科技公司担任高级研究员职位。',
      imageUrl: '/images/team/founder.jpg'
    },
    {
      name: '张华',
      role: 'CTO',
      bio: '区块链开发专家，Solana生态系统早期贡献者。曾领导多个成功的Web3项目开发。',
      imageUrl: '/images/team/cto.jpg'
    },
    {
      name: '王芳',
      role: '神经科学研究主管',
      bio: '神经科学博士，专注于记忆形成和存储的研究。发表过多篇关于脑机接口的学术论文。',
      imageUrl: '/images/team/research-lead.jpg'
    },
    {
      name: '赵强',
      role: '产品设计师',
      bio: '拥有8年用户体验设计经验，专注于新兴技术产品。曾为多家Fortune 500公司设计数字产品。',
      imageUrl: '/images/team/designer.jpg'
    }
  ];

  const faqItems = [
    {
      question: 'NeuraMint是如何工作的？',
      answer: 'NeuraMint使用先进的脑机接口技术捕捉用户的神经活动模式，然后通过我们专有的算法将这些模式转换为数字记忆。这些数字记忆被Mint为Solana区块链上的NFT，确保它们的真实性、独特性和所有权。'
    },
    {
      question: '捕捉记忆需要什么设备？',
      answer: 'NeuraMint与多种消费级脑机接口设备兼容，包括Neurosity Crown、Muse headband和EMOTIV设备。我们也在开发自己的专用设备，预计将在明年推出。'
    },
    {
      question: '记忆NFT可以做什么？',
      answer: '记忆NFT代表了独特的神经体验。它们可以被收藏、交易或用于各种元宇宙和Web3应用。艺术家可以将其创意过程Mint为NFT，教育工作者可以分享学习体验，治疗师可以记录治疗进展。'
    },
    {
      question: '我的神经数据安全吗？',
      answer: 'NeuraMint非常重视用户隐私和数据安全。所有神经数据都经过加密，且只有在用户明确同意的情况下才会被捕捉和处理。用户始终拥有自己数据的完全控制权。'
    },
    {
      question: '如何Validate记忆的真实性？',
      answer: '每个记忆NFT都包含一个独特的神经签名，这是从原始神经数据中派生出的。我们的Validate者网络使用先进的算法来Validate这些签名的真实性，确保每个记忆NFT都代表真实的神经活动。'
    },
    {
      question: 'NRAM代币有什么用途？',
      answer: 'NRAM是NeuraMint生态系统的实用代币。它用于支付记忆Mint费用，激励Validate者，并在平台治理中投票。持有NRAM也可以获得某些高级功能的访问权限。'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>[Chinese UI text] 关于 NeuraMint | 记忆NFT平台</title>
        <meta name="description" content="了解NeuraMint如何利用脑机接口技术在Solana区块链上Create MemoryNFT。" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 gradient-text"
            variants={fadeIn}
          >[Chinese UI text] 
            关于 NeuraMint
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            variants={fadeIn}
          >[Chinese UI text] 
            我们正在创造记忆的未来，将神经体验转化为区块链上的数字资产。
          </motion.p>
        </motion.div>
        
        {/* Mission Section */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeIn}
          >[Chinese UI text] 
            我们的使命
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-gray-800 p-8 rounded-xl"
              variants={fadeIn}
            >
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">[Chinese UI text] 捕捉人类体验</h3>
              <p className="text-gray-300">[Chinese UI text] 
                我们相信每个人的记忆和体验都是独特而宝贵的。我们的技术让这些内在体验变得可见、可分享和可保存。
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800 p-8 rounded-xl"
              variants={fadeIn}
            >
              <div className="text-4xl mb-4">⛓️</div>
              <h3 className="text-xl font-bold mb-2">[Chinese UI text] 去中心化记忆</h3>
              <p className="text-gray-300">[Chinese UI text] 
                通过区块链技术，我们创建了一个去中心化的记忆库，确保您的神经体验永远安全、真实且由您完全拥有。
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-800 p-8 rounded-xl"
              variants={fadeIn}
            >
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-2">[Chinese UI text] 连接人类</h3>
              <p className="text-gray-300">[Chinese UI text] 
                我们正在建立一个新的共享体验平台，让人们能够以前所未有的方式交流、学习和共享他们的内心世界。
              </p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Technology Section */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeIn}
          >[Chinese UI text] 
            我们的技术
          </motion.h2>
          
          <motion.div 
            className="bg-gray-800 p-8 rounded-xl"
            variants={fadeIn}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-4">[Chinese UI text] 神经捕捉技术</h3>
                <p className="text-gray-300 mb-4">[Chinese UI text] 
                  NeuraMint使用先进的脑机接口技术来捕捉和解释神经活动模式。我们的专有算法可以识别与特定记忆、情感和认知状态相关的独特模式。
                </p>
                <p className="text-gray-300 mb-4">[Chinese UI text] 
                  每个捕捉的记忆都会生成一个独特的神经签名，作为其真实性和独特性的证明。这种签名是通过复杂的数学变换从原始脑电图数据中派生出来的。
                </p>
                <p className="text-gray-300">[Chinese UI text] 
                  我们支持多种消费级脑机接口设备，使记忆捕捉技术可以被更多人使用。
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">[Chinese UI text] 区块链实现</h3>
                <p className="text-gray-300 mb-4">[Chinese UI text] 
                  我们选择Solana区块链作为我们的基础设施，因为它提供了高速交易和低费用，使记忆Mint和交易的体验更加顺畅。
                </p>
                <p className="text-gray-300 mb-4">[Chinese UI text] 
                  每个记忆NFT都包含元数据，如神经签名、捕捉时间、大脑区域活动和情感价值。这些数据存储在去中心化存储网络上，确保永久可访问。
                </p>
                <p className="text-gray-300">[Chinese UI text] 
                  我们的智能合约确保记忆NFT的创建、转移和交易都是安全和透明的。同时，我们的Validate者网络确保每个记忆都经过真实性Validate。
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Team Section */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeIn}
          >[Chinese UI text] 
            我们的团队
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="bg-gray-800 rounded-xl overflow-hidden"
                variants={fadeIn}
              >
                <div className="aspect-square w-full bg-gray-700">
                  {/* In a real app, this would be an actual image */}
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    👤
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-purple-400 mb-3">{member.role}</p>
                  <p className="text-gray-300 text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* FAQ Section */}
        <motion.div 
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2 
            className="text-3xl font-bold mb-8 text-center"
            variants={fadeIn}
          >
            FAQ
          </motion.h2>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <motion.div 
                key={index} 
                className="bg-gray-800 rounded-xl p-6"
                variants={fadeIn}
              >
                <h3 className="text-xl font-bold mb-3">{item.question}</h3>
                <p className="text-gray-300">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <motion.h2 
            className="text-3xl font-bold mb-6"
            variants={fadeIn}
          >[Chinese UI text] 
            加入我们的旅程
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            variants={fadeIn}
          >[Chinese UI text] 
            我们正在创造一个记忆可以被捕捉、分享和珍藏的世界。无论您是创作者、收藏家还是技术爱好者，NeuraMint都欢迎您。
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            variants={fadeIn}
          >
            <Link href="/mint" className="bg-gradient-to-r from-purple-600 to-green-500 px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90">[Chinese UI text] 
              开始Mint记忆
            </Link>
            <Link href="/marketplace" className="bg-gray-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-600">[Chinese UI text] 
              探索记忆Marketplace
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 