import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import Layout from '../components/layout/Layout';
import { getEnvironmentConfig } from '../utils/environment';
import Head from 'next/head';

// [Chinese comment] 全局应用组件
export default function MyApp({ Component, pageProps }: AppProps) {
  // [Chinese comment] 获取环境配置
  const config = getEnvironmentConfig();
  
  // [Chinese comment] 设置钱包适配器
  const network = config.isDevelopment ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => config.clusterUrl || clusterApiUrl(network), [network, config.clusterUrl]);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <>
      <Head>
        <title>NeuraMint | Memory NFTs on Solana</title>
        <meta name="description" content="Transform your memories into unique NFTs on the Solana blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content="NeuraMint | Memory NFTs on Solana" />
        <meta property="og:description" content="Transform your memories into unique NFTs on the Solana blockchain" />
        <meta property="og:image" content="/images/neuramint-social.png" />
        <meta property="og:url" content="https://www.neuramint.tech" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card Data */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NeuraMint | Memory NFTs on Solana" />
        <meta name="twitter:description" content="Transform your memories into unique NFTs on the Solana blockchain" />
        <meta name="twitter:image" content="/images/neuramint-social.png" />
      </Head>

      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
} 