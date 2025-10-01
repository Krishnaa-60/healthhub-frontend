import React from 'react';

const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        strokeWidth={1.5}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v.01M9 12v5a2 2 0 002 2h2a2 2 0 002-2v-5m0 0V3m0 0h.01M6 12a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5zM4 9h16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v3m0 0l-2-2m2 2l2-2" />
    </svg>
);

export default TrophyIcon;