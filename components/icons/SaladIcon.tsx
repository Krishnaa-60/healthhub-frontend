import React from 'react';

const SaladIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 9L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 7L9 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 8L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 13L14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 17L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

export default SaladIcon;