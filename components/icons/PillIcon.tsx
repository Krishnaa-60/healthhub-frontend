import React from 'react';

const PillIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.383,3.013l-7.37,7.37a7.003,7.003,0,1,0,9.9,9.9l7.37-7.37a7,7,0,1,0-9.9-9.9Zm5.8,8.783L10.81,19.169a5,5,0,0,1-7.07-7.07L11.114,4.725a5,5,0,0,1,7.07,7.07Z" />
    </svg>
);

export default PillIcon;
