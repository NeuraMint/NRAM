import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'NeuraMint | Memory Asset Solution on Solana', 
  description = 'Transform memories into digital assets on the Solana blockchain' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <Navbar />
      
      <main className="pt-20">
        {children}
      </main>
      
      <footer className="border-t border-gray-800 pt-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">NeuraMint</h3>
              <p className="text-gray-400">Transform memories into digital assets on the Solana blockchain.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/marketplace" className="hover:text-white">Marketplace</a></li>
                <li><a href="/mint" className="hover:text-white">Mint</a></li>
                <li><a href="/validate" className="hover:text-white">Validate</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/docs" className="hover:text-white">Documentation</a></li>
                <li><a href="/faq" className="hover:text-white">FAQ</a></li>
                <li><a href="/developers" className="hover:text-white">Developers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://x.com/NeuraMint_" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter</a></li>
                <li><a href="https://github.com/NeuraMint/NRAM" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 py-6">
            <p>© {new Date().getFullYear()} NeuraMint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 