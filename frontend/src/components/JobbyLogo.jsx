import React from 'react';

const JobbyLogo = ({ className = "h-8 w-8" }) => {
  return (
    <div className={`${className} bg-blue-600 rounded-full flex items-center justify-center shadow-lg`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full text-white p-1"
        fill="currentColor"
      >
        {/* Gear/Cog shape representing work/industry */}
        <path d="M50 15l5 10 12-2-2 12 10 5-10 5 2 12-12-2-5 10-5-10-12 2 2-12-10-5 10-5-2-12 12 2 5-10z" />
        {/* Handshake in center */}
        <g transform="translate(30, 35) scale(0.4)">
          <path d="M20 30c0-5.5 4.5-10 10-10s10 4.5 10 10v5h5c2.8 0 5 2.2 5 5s-2.2 5-5 5h-10c-5.5 0-10-4.5-10-10z"/>
          <path d="M60 35c0-2.8 2.2-5 5-5h5v-5c0-5.5 4.5-10 10-10s10 4.5 10 10c0 5.5-4.5 10-10 10h-10c-2.8 0-5-2.2-5-5z"/>
        </g>
      </svg>
    </div>
  );
};

export default JobbyLogo;