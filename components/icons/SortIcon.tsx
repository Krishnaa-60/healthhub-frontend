import React from 'react';

interface SortIconProps {
  className?: string;
  direction?: 'ascending' | 'descending' | null;
}

const SortIcon: React.FC<SortIconProps> = ({ className, direction }) => (
  <div className={`inline-flex flex-col items-center justify-center w-4 h-4 ml-1 ${className}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-2 w-2 transition-colors ${direction === 'ascending' ? 'text-primary-green dark:text-dark-accent' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-2 w-2 transition-colors ${direction === 'descending' ? 'text-primary-green dark:text-dark-accent' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

export default SortIcon;