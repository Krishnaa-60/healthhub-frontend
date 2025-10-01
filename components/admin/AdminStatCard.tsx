import React, { useState, useEffect } from 'react';

// --- Animated Counter Hook ---
const useAnimatedCounter = (endValue: number, duration = 1500) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        const animationFrame = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const easedPercentage = 1 - Math.pow(1 - percentage, 3); // easeOutCubic
            setCount(Math.floor(endValue * easedPercentage));
            if (progress < duration) {
                requestAnimationFrame(animationFrame);
            } else {
                setCount(endValue);
            }
        };
        requestAnimationFrame(animationFrame);
    }, [endValue, duration]);

    return count;
};

interface AdminStatCardProps {
    icon: React.FC<{ className?: string }>;
    title: string;
    value: number;
    onClick?: () => void;
}

const AdminStatCard: React.FC<AdminStatCardProps> = ({ icon: Icon, title, value, onClick }) => {
    const count = useAnimatedCounter(value);

    const content = (
         <>
            <div className="p-3 rounded-lg bg-primary-green/10 dark:bg-dark-accent/10">
                <Icon className="w-6 h-6 text-primary-green dark:text-dark-accent" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-800 dark:text-dark-text">{count}</div>
                <div className="text-sm text-gray-500 dark:text-dark-subtext">{title}</div>
            </div>
        </>
    );

    const baseClasses = "bg-white dark:bg-dark-card p-5 rounded-lg shadow-lg flex items-center space-x-4 w-full text-left border border-gray-200/80 dark:border-dark-subtext/10 transition-all";

    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={`${baseClasses} hover:border-primary-green/50 dark:hover:border-dark-accent/50 hover:shadow-xl`}
            >
                {content}
            </button>
        );
    }

    return (
        <div className={baseClasses}>
            {content}
        </div>
    );
};

export default AdminStatCard;
