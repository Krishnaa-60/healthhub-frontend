import React from 'react';

const SplashScreenLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#31D0AA"/>
        <stop offset="100%" stopColor="#27C690"/>
      </linearGradient>
    </defs>
    <path 
      d="M50 0L95.1 19.5V56.2C95.1 82 75.8 100 50 100C24.2 100 4.9 82 4.9 56.2V19.5L50 0Z" 
      fill="url(#splashGradient)"
    />
    <path 
      d="M55.2 46.9H51V42.7C51 42.1 50.5 41.7 50 41.7C49.5 41.7 49 42.1 49 42.7V46.9H44.8C44.3 46.9 43.8 47.3 43.8 47.9C43.8 48.5 44.3 48.9 44.8 48.9H49V53.1C49 53.7 49.5 54.1 50 54.1C50.5 54.1 51 53.7 51 53.1V48.9H55.2C55.7 48.9 56.2 48.5 56.2 47.9C56.2 47.3 55.7 46.9 55.2 46.9Z" 
      fill="white"
    />
  </svg>
);

export default SplashScreenLogo;
