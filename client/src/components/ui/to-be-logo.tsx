import React from 'react';

export function ToBePackingLogo({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <div className={`rounded-full ${className}`} style={{ backgroundColor: '#00645F' }}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Main "TOBE" text with circular styling */}
        <g transform="translate(50, 50)">
          <path d="M-30,-15 L-20,-15 M-25,-15 L-25,15 M-10,-15 A15,15 0 1 1 -10,15 A15,15 0 1 1 -10,-15 M10,-15 L20,-15 L20,15 L10,15 M30,-15 L10,-15 M30,0 L10,0 M30,15 L10,15" 
                stroke="white" 
                strokeWidth="3" 
                fill="none" />
        </g>
      </svg>
    </div>
  );
}