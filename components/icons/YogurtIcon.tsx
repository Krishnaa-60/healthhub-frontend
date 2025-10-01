import React from 'react';

const YogurtIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 20C14.2091 20 16 16.4183 16 12C16 7.58172 14.2091 4 12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="15" cy="8" r="1" fill="currentColor"/>
        <circle cx="9" cy="9" r="0.5" fill="currentColor"/>
        <circle cx="10" cy="15" r="1" fill="currentColor"/>
    </svg>
);

export default YogurtIcon;