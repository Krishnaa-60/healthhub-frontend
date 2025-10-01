import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="/assets/healthhub-logo.png" 
    alt="Healthhub Logo" 
    className={className} 
  />
);

export default LogoIcon;