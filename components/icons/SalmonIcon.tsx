import React from 'react';

const SalmonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 11C16 12.6569 14.2091 14 12 14C9.79086 14 8 12.6569 8 11C8 9.34315 9.79086 8 12 8C14.2091 8 16 9.34315 16 11Z" fill="currentColor" fillOpacity="0.3"/>
        <path d="M7 11.5L17 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 13.5C9.66667 14.5 14 14.5 16 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 9.5C9.66667 8.5 14 8.5 16 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

export default SalmonIcon;