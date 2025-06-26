import React from 'react';

export function ToBePackingActualLogo({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <div className={className}>
      <img 
        src="https://www.tobepacking.com/hs-fs/hubfs/logo-definitivo.png?width=200&height=200&name=logo-definitivo.png" 
        alt="To Be Packing Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}