import React from 'react';

interface GovLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'transparent' | 'white' | 'favicon';
}

export const GovLogo: React.FC<GovLogoProps> = ({ 
  className = "w-10 h-10", 
  size,
  showText = false,
  variant = 'transparent'
}) => {
  const imgSrc = variant === 'favicon' 
    ? '/brand/queueless-kacheri-favicon-square-hd.png'
    : variant === 'white'
    ? '/brand/queueless-kacheri-logo-hd.png'
    : '/brand/queueless-kacheri-logo-transparent-hd.png';

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <img
        src={imgSrc}
        alt="QueueLess Kacheri Government Logo"
        className="w-full h-full object-contain drop-shadow-md pointer-events-none transition-transform duration-200"
        loading="eager"
      />
    </div>
  );
};
