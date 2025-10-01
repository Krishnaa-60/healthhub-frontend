import React from 'react';

const UserAvatarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <img 
    src="/assets/login-avatar.png" 
    alt="Healthhub Login Avatar" 
    className={className} 
  />
);

export default UserAvatarIcon;