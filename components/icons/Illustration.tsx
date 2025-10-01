import React from 'react';

interface IllustrationProps {
    className?: string;
    theme: 'light' | 'dark';
}

const Illustration: React.FC<IllustrationProps> = ({ className, theme }) => {
  const imageUrl = theme === 'dark' 
    ? "/assets/doctors-illustration-dark.png" 
    : "/assets/doctors-illustration.png";
  
  return (
    <img 
      src={imageUrl} 
      alt="Illustration of medical professionals in a clinic setting" 
      className={className} 
    />
  );
};

export default Illustration;