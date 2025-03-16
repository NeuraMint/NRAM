import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Navigation links项
interface NavItem {
  label: string;
  href: string;
  requiresAuth?: boolean;
}

// 主Navigation links
const mainNavItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Marketplace', href: '/market' },
  { label: 'Create Memory', href: '/create-memory', requiresAuth: true },
  { label: 'Validator Center', href: '/validator-dashboard', requiresAuth: true },
];

export default function Navigation() {
  const router = useRouter();
  const { connected } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 判断Links是否活跃
  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  // [Chinese comment] 移动菜单切换
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo 和主Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-xl font-bold text-blue-600">NeuraMint</a>
              </Link>
            </div>
            
            {/* 桌面Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 sm:items-center">
              {mainNavItems.map((item) =>[Chinese UI text]  {
                // [Chinese comment] 如果需要认证且未连接钱包，则不显示该项
                if (item.requiresAuth && !connected) return null;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <a 
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* 钱包连接按钮和移动菜单按钮 */}
          <div className="flex items-center">
            <div className="mr-2">
              <WalletMultiButton />
            </div>
            
            {/* 移动菜单按钮 */}
            <div className="flex sm:hidden">
              <button 
                type="button" 
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">[Chinese UI text] 打开主菜单</span>[Chinese UI text] 
                {/* 汉堡菜单图标 */}
                {!mobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>[Chinese UI text] 
      
      {/* 移动菜单 */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {mainNavItems.map((item) =>[Chinese UI text]  {
              // [Chinese comment] 如果需要认证且未连接钱包，则不显示该项
              if (item.requiresAuth && !connected) return null;
              
              return (
                <Link key={item.href} href={item.href}>
                  <a 
                    className={`block px-3 py-2 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
} 