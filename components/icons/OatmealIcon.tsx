import React from 'react';

const OatmealIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path 
            d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.2"/>
        <circle cx="11" cy="10" r="1" fill="currentColor"/>
        <circle cx="14" cy="13" r="1" fill="currentColor"/>
        <circle cx="10" cy="14" r="0.5" fill="currentColor"/>
    </svg>
);

export default OatmealIcon;