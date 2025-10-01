import React from 'react';

const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 14H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 4L11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M15 4L13 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="9" cy="7" r="1" fill="currentColor"/>
        <circle cx="15" cy="7" r="1" fill="currentColor"/>
        <path d="M5 12V8C5 5.79086 6.79086 4 9 4H15C17.2091 4 19 5.79086 19 8V12" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

export default RobotIcon;