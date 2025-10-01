import React, { useState } from 'react';
import LogoIcon from './icons/LogoIcon';
import { AuthMode, AppView } from '../types';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';
import HomeIcon from './icons/HomeIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import MailIcon from './icons/MailIcon';

interface HeaderProps {
  setAuthMode: (mode: AuthMode) => void;
  setView: (view: AppView) => void;
  theme: string;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ setAuthMode, setView, theme, toggleTheme }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (view: AppView, mode?: AuthMode) => {
    setView(view);
    if (mode) {
      setAuthMode(mode);
    }
    setIsMobileMenuOpen(false);
  };

  // FIX: Switched to React.FC to explicitly define a component with children, resolving a TypeScript error.
  const NavButton: React.FC<{ children: React.ReactNode; onClick: () => void; }> = ({ children, onClick }) => (
    <button onClick={onClick} className="text-gray-600 dark:text-dark-subtext hover:text-primary-green dark:hover:text-dark-accent transition-colors duration-300 px-3 py-2 rounded-md text-sm font-semibold">
      {children}
    </button>
  );

  const RegisterButton = () => (
     <button 
        onClick={() => {
            setView('auth');
            setAuthMode(AuthMode.REGISTER);
        }}
        className="ml-4 text-white bg-primary-green hover:bg-primary-green-dark transition-colors duration-300 font-bold py-2 px-4 rounded-md text-sm shadow-sm"
      >
        Register
      </button>
  );

  const MobileNavButton: React.FC<{
      icon: React.ReactNode;
      label: string;
      onClick: () => void;
  }> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick} 
        className="flex items-center gap-4 text-lg font-semibold text-gray-800 dark:text-dark-text p-3 rounded-lg w-full text-left transition-all duration-200 hover:bg-gray-100 dark:hover:bg-dark-bg hover:pl-5"
    >
        {icon}
        {label}
    </button>
  );
  
  return (
    <>
      <header className="w-full bg-white dark:bg-dark-card p-3 z-20 shadow-md dark:shadow-none dark:border-b dark:border-dark-subtext/20">
        <div className="container mx-auto flex justify-between items-center">
          <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => {
                  setView('auth');
                  setAuthMode(AuthMode.LOGIN);
              }}
          >
            <LogoIcon className="w-10 h-10" />
            <span className="text-xl font-bold text-gray-800 dark:text-dark-text tracking-wide">Health Hub</span>
          </div>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center">
            <NavButton onClick={() => { setView('auth'); setAuthMode(AuthMode.LOGIN); }}>Home</NavButton>
            <NavButton onClick={() => setView('about')}>About us</NavButton>
            <NavButton onClick={() => setView('contact')}>Contact us</NavButton>
            <RegisterButton />
            <button
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-full text-gray-600 dark:text-dark-subtext hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
          </nav>
          {/* Mobile Nav Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-dark-subtext hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="ml-2 p-2 rounded-md text-gray-600 dark:text-dark-subtext hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-30 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'bg-black bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white dark:bg-dark-card shadow-xl z-40 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" 
        aria-modal="true"
      >
        <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                    <LogoIcon className="w-10 h-10" />
                    <span className="text-xl font-bold text-gray-800 dark:text-dark-text">Health Hub</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full text-gray-600 dark:text-dark-subtext hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    aria-label="Close menu"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <nav className="flex flex-col space-y-3">
               <MobileNavButton icon={<HomeIcon className="w-6 h-6" />} label="Home" onClick={() => handleMobileNavClick('auth', AuthMode.LOGIN)} />
               <MobileNavButton icon={<InformationCircleIcon className="w-6 h-6" />} label="About Us" onClick={() => handleMobileNavClick('about')} />
               <MobileNavButton icon={<MailIcon className="w-6 h-6" />} label="Contact Us" onClick={() => handleMobileNavClick('contact')} />
            </nav>
            <div className="mt-auto pt-4">
                <button 
                  onClick={() => handleMobileNavClick('auth', AuthMode.REGISTER)}
                  className="w-full mt-4 text-white bg-primary-green hover:bg-primary-green-dark transition-colors duration-300 font-bold py-3 px-4 rounded-md text-base shadow-sm"
                >
                  Register
                </button>
            </div>
          </div>
      </div>
    </>
  );
};

export default Header;