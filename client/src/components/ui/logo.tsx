import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const JewelLogo: React.FC<LogoProps> = ({ 
  size = 48, 
  className = 'text-secondary' 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Diamond shape */}
      <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="none" />
      
      {/* Inner details to make it look like a gem */}
      <path d="M12 2L7 12L12 22" stroke="currentColor" strokeOpacity="0.5" />
      <path d="M12 2L17 12L12 22" stroke="currentColor" strokeOpacity="0.5" />
      
      {/* Sparkle effect */}
      <path d="M12 7L13 5L12 3" strokeWidth="1" />
      <path d="M16 12L18 11L20 12" strokeWidth="1" />
      <path d="M12 17L11 19L12 21" strokeWidth="1" />
      <path d="M8 12L6 13L4 12" strokeWidth="1" />
      
      {/* Connection links */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="17" cy="12" r="0.6" fill="currentColor" />
      <circle cx="7" cy="12" r="0.6" fill="currentColor" />
      <circle cx="12" cy="7" r="0.6" fill="currentColor" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" />
    </svg>
  );
};

export default JewelLogo;