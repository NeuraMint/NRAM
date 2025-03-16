import React from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import Navigation from './Navigation';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
}

export default function Layout({ 
  children, 
  title = 'NeuraMint | Memory NFT Platform on Solana',
  description = 'Transform memories into digital assets on the Solana blockchain',
  image = '/images/neuramint-social.png'
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="NeuraMint" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Head>
      
      {/* Navigation栏 */}
      <Navigation />
      
      {/* 主内容 */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* 页脚 */}
      <Footer />
      
      {/* 全局消息提示 */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#FFFFFF',
            color: '#374151',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            padding: '0.75rem 1rem',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </div>
  );
} 