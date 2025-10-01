import React from 'react';

const ChartPlaceholderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`w-full h-full text-dark-subtext ${className}`}>
        {/* Chart 1: Line and Bar Combo */}
        <svg width="100%" height="auto" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid Lines */}
            <line x1="10" y1="20" x2="290" y2="20" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
            <line x1="10" y1="50" x2="290" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
            <line x1="10" y1="80" x2="290" y2="80" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
            
            {/* Y-axis labels */}
            <text x="0" y="24" fontSize="10" fill="currentColor">100</text>
            <text x="0" y="84" fontSize="10" fill="currentColor">0</text>
            
            {/* Line Chart */}
            <path d="M 40 60 L 80 40 L 120 50 L 160 30" stroke="#31D0AA" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
            <circle cx="40" cy="60" r="2" fill="#31D0AA"/>
            <circle cx="80" cy="40" r="2" fill="#31D0AA"/>
            <circle cx="120" cy="50" r="2" fill="#31D0AA"/>
            <circle cx="160" cy="30" r="2" fill="#31D0AA"/>
            
            {/* Bar Chart */}
            <rect x="190" y="50" width="20" height="30" fill="currentColor" fillOpacity="0.3"/>
            <rect x="220" y="40" width="20" height="40" fill="currentColor" fillOpacity="0.3"/>
            <rect x="250" y="20" width="20" height="60" fill="#31D0AA" fillOpacity="0.7"/>

            {/* X-axis labels */}
            <text x="35" y="100" fontSize="10" fill="currentColor">2019</text>
            <text x="75" y="100" fontSize="10" fill="currentColor">2020</text>
            <text x="115" y="100" fontSize="10" fill="currentColor">2021</text>
            <text x="155" y="100" fontSize="10" fill="currentColor">2022</text>
            <text x="185" y="100" fontSize="10" fill="currentColor">2023</text>
            <text x="215" y="100" fontSize="10" fill="currentColor">2024</text>
            <text x="245" y="100" fontSize="10" fill="currentColor">2025</text>
        </svg>

        {/* Chart 2: Line Chart */}
        <svg width="100%" height="auto" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
             {/* Grid Lines */}
            <line x1="10" y1="20" x2="290" y2="20" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
            <line x1="10" y1="50" x2="290" y2="50" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
            <line x1="10" y1="80" x2="290" y2="80" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"/>
            
             {/* Y-axis labels */}
            <text x="0" y="24" fontSize="10" fill="currentColor">100</text>
            <text x="0" y="84" fontSize="10" fill="currentColor">0</text>
            
            {/* Line Chart */}
            <path d="M 40 70 L 80 60 L 120 75 L 160 55 L 200 65 L 240 50 L 280 60" stroke="#31D0AA" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
            <circle cx="40" cy="70" r="2" fill="#31D0AA"/>
            <circle cx="80" cy="60" r="2" fill="#31D0AA"/>
            <circle cx="120" cy="75" r="2" fill="#31D0AA"/>
            <circle cx="160" cy="55" r="2" fill="#31D0AA"/>
            <circle cx="200" cy="65" r="2" fill="#31D0AA"/>
            <circle cx="240" cy="50" r="2" fill="#31D0AA"/>
            <circle cx="280" cy="60" r="2" fill="#31D0AA"/>

             {/* X-axis labels */}
            <text x="35" y="100" fontSize="10" fill="currentColor">2019</text>
            <text x="75" y="100" fontSize="10" fill="currentColor">2020</text>
            <text x="115" y="100" fontSize="10" fill="currentColor">2021</text>
            <text x="155" y="100" fontSize="10" fill="currentColor">2022</text>
            <text x="185" y="100" fontSize="10" fill="currentColor">2023</text>
            <text x="215" y="100" fontSize="10" fill="currentColor">2024</text>
            <text x="245" y="100" fontSize="10" fill="currentColor">2025</text>
        </svg>
    </div>
);

export default ChartPlaceholderIcon;