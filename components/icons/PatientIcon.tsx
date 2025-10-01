import React from 'react';

const PatientIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className} 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Hands */}
        <path d="M10 40 Q20 30, 30 42 C 25 55, 10 55, 10 40 Z" fill="#FFCCBC" transform="rotate(-15, 20, 45)"/>
        <path d="M90 40 Q80 30, 70 42 C 75 55, 90 55, 90 40 Z" fill="#FFCCBC" transform="rotate(15, 80, 45)"/>

        {/* Shield */}
        <path d="M50 15 L85 30 V 65 C 85 85, 65 95, 50 95 C 35 95, 15 85, 15 65 V 30 Z" fill="#27C690"/>
        
        {/* Cross */}
        <rect x="44" y="42" width="12" height="26" rx="2" fill="white"/>
        <rect x="37" y="49" width="26" height="12" rx="2" fill="white"/>

        {/* Person */}
        <g transform="translate(0, -10)">
            <circle cx="50" cy="35" r="8" fill="#FFEB3B"/>
            <path d="M42 45 C 42 55, 58 55, 58 45 Z" fill="#42A5F5"/>
        </g>
    </svg>
);

export default PatientIcon;
