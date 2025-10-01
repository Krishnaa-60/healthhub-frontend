import React from 'react';

const AvatarIshwaryaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#fdd8b8"/>
      {/* Hair */}
      <path d="M25,90 C15,70 20,30 35,25 C50,20 60,25 70,35 C85,45 85,75 75,90 L25,90 Z" fill="#6D4C41"/>
      <path d="M28 28 C 40 20, 60 20, 72 28" stroke="#5D4037" strokeWidth="4" fill="none"/>
      <path d="M25,90 Q 50 95, 75 90" stroke="#6D4C41" strokeWidth="2" fill="none"/>
      {/* Eyes */}
      <circle cx="38" cy="55" r="4" fill="#4A2C2A"/>
      <circle cx="62" cy="55" r="4" fill="#4A2C2A"/>
      {/* Mouth */}
      <path d="M45 70 Q 50 75, 55 70" stroke="#E57373" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Shirt */}
       <path d="M30 88 H 70 C 70 95, 60 100, 50 100 C 40 100, 30 95, 30 88 Z" fill="#F48FB1"/>
    </svg>
);

export default AvatarIshwaryaIcon;
