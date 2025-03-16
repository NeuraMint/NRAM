import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { WalletMultiButton } from './WalletConnect';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position to add background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () =>[Chinese UI text]  window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Marketplace', path: '/marketplace' },
    { title: 'Mint', path: '/mint' },
    { title: 'Validate', path: '/validate' },
    { title: '关于', path: '/about' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'bg-gray-900/90 backdrop-blur-md shadow-lg' : 'bg-transparent'} transition-all duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 mr-3">
                <svg viewBox="0 0 500 500" className="w-full h-full">
                  <rect width="500" height="500" fill="#080A14" rx="20" ry="20"/>
                  <path d="M250,90 C290,90 325,95 350,110 C375,125 390,145 400,170 C410,195 415,220 410,250 C405,280 395,305 380,330 C365,355 345,370 320,380 C295,390 275,395 250,395 C225,395 205,390 180,380 C155,370 135,355 120,330 C105,305 95,280 90,250 C85,220 90,195 100,170 C110,145 125,125 150,110 C175,95 210,90 250,90z" fill="none" stroke="#9945FF" strokeWidth="3" strokeOpacity="0.4"/>
                  <circle cx="250" cy="200" r="25" fill="#14F195"/>
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-300 bg-clip-text text-transparent">NeuraMint</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`transition-colors ${
                    router.pathname === link.path 
                      ? 'text-purple-400 font-medium' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.title}
                </Link>
              ))}
            </div>
            <WalletMultiButton />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`py-2 transition-colors ${
                    router.pathname === link.path 
                      ? 'text-purple-400 font-medium' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.title}
                </Link>
              ))}
              <div className="pt-2">
                <WalletMultiButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 