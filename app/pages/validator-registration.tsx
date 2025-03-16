import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Toaster, toast } from 'react-hot-toast';
import { ApiService } from '../services/apiService';
import { ValidationService } from '../services/validationService';

const ValidatorRegistration: React.FC = () => {
  const router = useRouter();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  
  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isValidator, setIsValidator] = useState<boolean>(false);
  const [stakeAmount, setStakeAmount] = useState<number>[Chinese UI text] (1); // [Chinese comment] 默认1 SOL
  const [minStakeAmount, setMinStakeAmount] = useState<number>[Chinese UI text] (1); // [Chinese comment] 最小质押金额，单位SOL
  const [balance, setBalance] = useState<number>(0); // [Chinese comment] 钱包余额
  
  // Service instances
  const apiService = new ApiService();
  const validationService = new ValidationService();
  
  // [Chinese comment] 检查用户是否已是Validate者
  useEffect(() => {
    const checkValidatorStatus = async () => {
      if (!connected || !publicKey) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // [Chinese comment] 调用Validate服务检查用户是否已是Validate者
        const isUserValidator = await validationService.isValidator(publicKey);
        setIsValidator(isUserValidator);
        
        // [Chinese comment] 获取钱包余额
        const response = await fetch(`https://api.mainnet-beta.solana.com`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [publicKey.toString()]
          })
        });
        
        const data = await response.json();
        if (data.result && data.result.value !== undefined) {
          setBalance(data.result.value / LAMPORTS_PER_SOL);
        }
      } catch (error) {
        console.error('检查Validate者状态失败:', error);
        toast.error('[Chinese UI text] 无法获取Validate者状态');
      } finally {
        setLoading(false);
      }
    };
    
    checkValidatorStatus();
  }, [connected, publicKey]);
  
  // Register as a validator
  const handleRegister = async () =>[Chinese UI text]  {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (stakeAmount < minStakeAmount) {
      toast.error(`质押金额不能低于${minStakeAmount} SOL`);
      return;
    }
    
    if (stakeAmount >[Chinese UI text]  balance) {
      toast.error('[Chinese UI text] 质押金额不能超过钱包余额');
      return;
    }
    
    setIsRegistering(true);
    const toastId = toast.loading('Registering as validator...');
    
    try {
      // [Chinese comment] 调用Validate服务Register validator
      await validationService.registerValidator(
        publicKey,
        stakeAmount * LAMPORTS_PER_SOL // Convert to lamports
      );
      
      toast.success('[Chinese UI text] 成功注册为Validate者！', { id: toastId });
      
      // [Chinese comment] 重定向到Validate者控制面板
      router.push('/validator-dashboard');
    } catch (error) {
      console.error('Register validator失败:', error);
      toast.error('[Chinese UI text] Register validator失败，请重试', { id: toastId });
    } finally {
      setIsRegistering(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Register as a validator | NeuraMint</title>
        <meta name="description" content="成为NeuraMint平台的记忆Validate者" />
      </Head>
      
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold">[Chinese UI text] Become a Memory Validator</h1>
        
        {!connected ? (
          <div className="flex flex-col items-center justify-center p-8 mb-8 bg-gray-100 rounded-lg">
            <p className="mb-4 text-lg">[Chinese UI text] 请连接钱包以继续注册</p>
            <WalletMultiButton />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : isValidator ? (
          <div className="p-8 text-center bg-green-100 rounded-lg">
            <h2 className="text-xl font-bold text-green-800">[Chinese UI text] 您已是Validate者</h2>
            <p className="mt-2 text-green-700">[Chinese UI text] 您已经成功注册为NeuraMintValidate者</p>
            <button
              onClick={() => router.push('/validator-dashboard')}
              className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
            >[Chinese UI text] 
              前往Validate者控制面板
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Validate者信息面板 */}
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-6 text-2xl font-bold">[Chinese UI text] Validate者介绍</h2>
                
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-semibold">[Chinese UI text] 什么是记忆Validate者？</h3>
                  <p className="text-gray-700">[Chinese UI text] 
                    记忆Validate者是NeuraMint平台的重要参与者，负责Validate记忆NFT的真实性和质量。
                    通过质押SOL代币，您可以获得Validate权限，并通过提供有质量的Validate获取Rewards。
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-semibold">[Chinese UI text] 成为Validate者的好处</h3>
                  <ul className="pl-5 space-y-2 text-gray-700 list-disc">
                    <li>[Chinese UI text] 每次成功Validate可获得ValidateRewards</li>
                    <li>[Chinese UI text] 参与决定哪些记忆有资格在平台上流通</li>
                    <li>[Chinese UI text] 提高平台上记忆数据的质量和真实性</li>
                    <li>[Chinese UI text] 建立Validate声誉，获得更多Validate机会</li>
                  </ul>
                </div>
                
                <div className="p-4 mb-6 bg-blue-50 rounded-lg">
                  <h3 className="mb-2 text-lg font-semibold text-blue-800">[Chinese UI text] Validate者Requirements</h3>
                  <ul className="pl-5 space-y-1 text-blue-700 list-disc">
                    <li>[Chinese UI text] 最低质押 {minStakeAmount} SOL</li>
                    <li>[Chinese UI text] 保持高质量的Validate记录</li>
                    <li>[Chinese UI text] 遵守平台的Validate准则</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="mb-2 text-lg font-semibold text-yellow-800">[Chinese UI text] 注意事项</h3>
                  <ul className="pl-5 space-y-1 text-yellow-700 list-disc">
                    <li>[Chinese UI text] 质押的SOL将在您活跃为Validate者期间被锁定</li>
                    <li>[Chinese UI text] 如果提供虚假Validate，可能会失去部分质押</li>
                    <li>[Chinese UI text] 您可以随时取消质押，但需要等待7天的冷却期</li>
                  </ul>
                </div>
              </div>
              
              {/* 注册表单面板 */}
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-6 text-2xl font-bold">[Chinese UI text] 注册表单</h2>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-lg font-medium" htmlFor="stakeAmount">[Chinese UI text] 
                      质押金额 (SOL)
                    </label>
                    <span className="text-sm text-gray-500">[Chinese UI text] 
                      钱包余额: {balance.toFixed(2)} SOL
                    </span>
                  </div>
                  
                  <div className="relative mb-4">
                    <input
                      id="stakeAmount"
                      type="number"
                      min={minStakeAmount}
                      step={0.1}
                      max={balance}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-700 pointer-events-none">
                      SOL
                    </div>
                  </div>
                  
                  <div className="flex mb-2">
                    <input
                      type="range"
                      min={minStakeAmount}
                      max={Math.min(10, balance)}
                      step={0.1}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>[Chinese UI text] 最低: {minStakeAmount} SOL</span>
                    <span>[Chinese UI text] 建议: 2 SOL</span>
                    <span>[Chinese UI text] 最高: 10 SOL</span>
                  </div>
                </div>
                
                <div className="p-4 mb-6 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">[Chinese UI text] 预计每日收益:</span>
                    <span className="font-bold text-green-600">
                      ~{(stakeAmount * 0.02).toFixed(3)} SOL
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">[Chinese UI text] 
                    实际收益取决于您的Validate数量和质量，以上仅为估算值。Validate者平均每天可以处理约10个Validate请求。
                  </p>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <input
                      id="termsAgreement"
                      type="checkbox"
                      required
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="termsAgreement" className="ml-2 text-sm text-gray-700">[Chinese UI text] 
                      我已阅读并同意<a href="#" className="text-blue-600 hover:underline">[Chinese UI text] Validate者条款和条件</a>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                    disabled={isRegistering}
                  >[Chinese UI text] 
                    返回
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || balance < minStakeAmount}
                    className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isRegistering ? '处理中...' : 'Register as a validator'}
                  </button>
                </div>
                
                {balance < minStakeAmount && (
                  <p className="mt-4 text-sm text-center text-red-600">[Chinese UI text] 
                    您的钱包余额不足，无法满足最低质押Requirements
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-6 mt-8 text-center bg-gray-100 rounded-lg">
              <h3 className="mb-2 text-xl font-semibold">[Chinese UI text] 有疑问？</h3>
              <p className="mb-4 text-gray-700">[Chinese UI text] 
                如果您对成为Validate者有任何疑问，请查看我们的<a href="#" className="text-blue-600 hover:underline">FAQ</a>[Chinese UI text] 或
                <a href="#" className="text-blue-600 hover:underline">[Chinese UI text] 联系我们</a>
              </p>
            </div>
          </>
        )}
      </div>
      
      <Toaster position="bottom-right" />
    </>
  );
};

export default ValidatorRegistration; 