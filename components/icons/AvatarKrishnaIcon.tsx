import React from 'react';

const AvatarKrishnaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Face */}
      <circle cx="50" cy="50" r="40" fill="#fdd8b8"/>
      {/* Hair */}
      <path d="M20 70 C 20 30, 80 30, 80 70 C 90 50, 90 20, 50 15 C 10 20, 10 50, 20 70 Z" fill="#4A2C2A"/>
      <path d="M25 80 Q 50 90, 75 80" stroke="#4A2C2A" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Eyes */}
      <circle cx="38" cy="50" r="4" fill="#4A2C2A"/>
      <circle cx="62" cy="50" r="4" fill="#4A2C2A"/>
      {/* Glasses */}
      <rect x="28" y="42" width="20" height="16" rx="8" stroke="#333" strokeWidth="3" fill="none"/>
      <rect x="52" y="42" width="20" height="16" rx="8" stroke="#333" strokeWidth="3" fill="none"/>
      <line x1="48" y1="50" x2="52" y2="50" stroke="#333" strokeWidth="3"/>
      {/* Mouth */}
      <path d="M45 65 Q 50 70, 55 65" stroke="#E57373" strokeWidth="3" fill="none" strokeLinecap="round"/>
       {/* Shirt */}
      <path d="M30 88 H 70 C 70 95, 60 100, 50 100 C 40 100, 30 95, 30 88 Z" fill="#81D4FA"/>
    </svg>
);

export default AvatarKrishnaIcon;
