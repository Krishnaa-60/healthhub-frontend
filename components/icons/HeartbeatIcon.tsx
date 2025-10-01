import React from 'react';

const HeartbeatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={1.5}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12H6l.462-1.42a1 1 0 011.916.038L9 12l1.09-3.273a1 1 0 011.838-.052L13 12l.83-2.5a1 1 0 011.9.06L17 12h3.75" />
    </svg>
);

export default HeartbeatIcon;