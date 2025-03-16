import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand and copyright */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">NeuraMint</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              &copy; {currentYear} NeuraMint. All rights reserved
            </p>
          </div>
          
          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8">
            {/* Navigation links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/">
                    <a className="text-sm text-gray-600 hover:text-blue-600">Home</a>
                  </Link>
                </li>
                <li>
                  <Link href="/market">
                    <a className="text-sm text-gray-600 hover:text-blue-600">Marketplace</a>
                  </Link>
                </li>
                <li>
                  <Link href="/create-memory">
                    <a className="text-sm text-gray-600 hover:text-blue-600">Create Memory</a>
                  </Link>
                </li>
                <li>
                  <Link href="/validator-dashboard">
                    <a className="text-sm text-gray-600 hover:text-blue-600">Validator Center</a>
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Resource links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Documentation</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600">API</a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Help Center</a>
                </li>
              </ul>
            </div>
            
            {/* Community links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Community</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://x.com/NeuraMint_" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600">Twitter</a>
                </li>
                <li>
                  <a href="https://github.com/NeuraMint/NRAM" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600">GitHub</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            NeuraMint is a decentralized memory NFT platform built on the Solana blockchain. All transactions are executed by smart contracts, and the platform is not responsible for user content and transactions.
          </p>
        </div>
      </div>
    </footer>
  );
} 