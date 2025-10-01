import React from 'react';

const WelcomeIllustration: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="screenGradWelcome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E6F7F5" />
            </linearGradient>
            <filter id="shadowWelcome" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
                <feOffset in="blur" dy="5" result="offsetBlur" />
                <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge> 
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/> 
                </feMerge>
            </filter>
        </defs>

        {/* --- Screen --- */}
        <g transform="translate(100, 50)" filter="url(#shadowWelcome)">
            <rect x="0" y="0" width="450" height="300" rx="20" fill="url(#screenGradWelcome)" stroke="#CFD8DC" strokeWidth="1"/>
            <rect x="0" y="300" width="450" height="20" rx="5" fill="#CFD8DC" />
            <rect x="200" y="320" width="50" height="10" rx="5" fill="#B0BEC5" />
            <rect x="150" y="330" width="150" height="20" rx="10" fill="#CFD8DC" />

            {/* --- Content on Screen --- */}
            {/* Title */}
            <text x="30" y="60" fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill="#374151">Health Analytics</text>
            
            {/* Line Chart */}
            <g transform="translate(30, 100)">
                <path d="M0 80 L30 60 L60 70 L90 40 L120 50 L150 30" stroke="#27C690" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <circle cx="150" cy="30" r="4" fill="#27C690" stroke="white" strokeWidth="2"/>
            </g>

             {/* Bar Chart */}
            <g transform="translate(220, 100)">
                <rect x="0" y="50" width="20" height="60" fill="#80CBC4" rx="3" />
                <rect x="30" y="30" width="20" height="80" fill="#4DB6AC" rx="3" />
                <rect x="60" y="10" width="20" height="100" fill="#26A69A" rx="3" />
                <rect x="90" y="40" width="20" height="70" fill="#4DB6AC" rx="3" />
            </g>

            {/* Pie Chart */}
             <g transform="translate(370, 180)">
                <circle cx="0" cy="0" r="50" fill="#B2DFDB" />
                <path d="M0 0 L 50 0 A 50 50 0 0 1 15.45 -47.55 L 0 0 Z" fill="#26A69A" />
                <path d="M0 0 L 15.45 -47.55 A 50 50 0 0 1 -40.45 -29.38 L 0 0 Z" fill="#FFAB91" />
            </g>

        </g>

        {/* --- Doctor/Nurse --- */}
        <g transform="translate(600, 200)">
            {/* Body */}
            <path d="M-80 350 L-80 120 C-80 80, -60 50, 0 50 C60 50, 80 80, 80 120 L80 350 Z" fill="#FFFFFF" />
            {/* Coat opening */}
            <path d="M0 70 L15 120 L15 350 L-15 350 L-15 120 Z" fill="#E0F2F1" />
            
            {/* Stethoscope */}
            <path d="M-30 60 C-20 100, 20 100, 30 60" stroke="#757575" strokeWidth="5" fill="none" />
            <circle cx="0" cy="115" r="12" fill="#424242" />
            <circle cx="0" cy="115" r="7" fill="#BDBDBD" />
            
             {/* Arm */}
            <g transform="rotate(-30, -50, 150)">
                <path d="M-70 150 C-100 150, -100 200, -70 200 L-20 200 C10 200, 10 150, -20 150 Z" fill="white" />
                {/* Hand */}
                <circle cx="-90" cy="175" r="20" fill="#FFD180" />
            </g>
            {/* Pointer finger */}
             <path d="M-105 160 L-140 120 L-125 110 Z" fill="#FFD180"/>

            {/* Head */}
            <circle cx="0" cy="0" r="50" fill="#FFD180" />
            {/* Hair */}
            <path d="M-50 0 C-50 -50, 50 -50, 50 0" fill="#6D4C41" />
            {/* Eyes */}
            <circle cx="-15" cy="-5" r="5" fill="white" />
            <circle cx="15" cy="-5" r="5" fill="white" />
            <circle cx="-15" cy="-5" r="2" fill="#424242" />
            <circle cx="15" cy="-5" r="2" fill="#424242" />
            {/* Mouth */}
            <path d="M-10 15 Q0 25, 10 15" stroke="#424242" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Stethoscope Earpieces */}
            <path d="M-40 -40 C-70 -70, -70 20, -40 50" stroke="#757575" strokeWidth="5" fill="none" />
            <path d="M40 -40 C70 -70, 70 20, 40 50" stroke="#757575" strokeWidth="5" fill="none" />
            <circle cx="-40" cy="50" r="6" fill="#424242" />
            <circle cx="40" cy="50" r="6" fill="#424242" />
        </g>
    </svg>
);

export default WelcomeIllustration;