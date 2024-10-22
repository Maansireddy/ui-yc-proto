import React from 'react';
import { FaBalanceScale } from 'react-icons/fa';

const ClaimWheel: React.FC = () => {
  const segments = 28; // Number of lighter segments around the wheel

  return (
    <div className="relative w-96 h-96">
      {/* Main circle with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full shadow-lg"></div>
      
      {/* Lighter segments */}
      {Array.from({ length: segments }).map((_, index) => (
        <div
          key={index}
          className="absolute inset-0"
          style={{
            transform: `rotate(${index * (360 / segments)}deg)`,
          }}
        >
          <div 
            className="absolute top-0 left-1/2 w-4 h-8 bg-purple-300 opacity-30 rounded-full"
            style={{ transform: 'translateX(-50%)' }}
          ></div>
        </div>
      ))}

      {/* Center white circle */}
      <div className="absolute inset-8 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
        <FaBalanceScale className="text-4xl text-purple-600 mb-2" />
        <span className="text-2xl font-bold text-purple-800">Law On The Go</span>
      </div>

      {/* Cross lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-purple-300 opacity-30"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-px h-full bg-purple-300 opacity-30"></div>
      </div>
    </div>
  );
};

export default ClaimWheel;
