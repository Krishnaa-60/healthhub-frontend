import React from 'react';

// Mock data for the last 7 days. In a real app, this would come from the backend.
const MOCK_DATA = [
    { day: 'Sun', users: 2 },
    { day: 'Mon', users: 5 },
    { day: 'Tue', users: 3 },
    { day: 'Wed', users: 7 },
    { day: 'Thu', users: 4 },
    { day: 'Fri', users: 9 },
    { day: 'Sat', users: 6 },
];

const UserBarChart: React.FC = () => {
    const maxValue = Math.max(...MOCK_DATA.map(d => d.users), 10);
    const chartHeight = 200;
    const barWidth = 30;
    const barMargin = 20;

    return (
        <div className="w-full h-[250px]">
            <svg width="100%" height="100%" viewBox={`0 0 ${MOCK_DATA.length * (barWidth + barMargin)} ${chartHeight + 30}`}>
                <g>
                    {MOCK_DATA.map((data, index) => {
                        const barHeight = (data.users / maxValue) * chartHeight;
                        const x = index * (barWidth + barMargin);
                        const y = chartHeight - barHeight;

                        return (
                            <g key={data.day} className="transition-transform transform-gpu hover:scale-y-105 origin-bottom">
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    fill="url(#barGradient)"
                                    rx="4"
                                />
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 8}
                                    textAnchor="middle"
                                    fill="#E0EFFF"
                                    fontSize="12"
                                    fontWeight="bold"
                                >
                                    {data.users}
                                </text>
                                <text
                                    x={x + barWidth / 2}
                                    y={chartHeight + 20}
                                    textAnchor="middle"
                                    fill="#8899B5"
                                    fontSize="12"
                                >
                                    {data.day}
                                </text>
                            </g>
                        );
                    })}
                </g>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#31D0AA" />
                        <stop offset="100%" stopColor="#31D0AA" stopOpacity="0.3" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default UserBarChart;
