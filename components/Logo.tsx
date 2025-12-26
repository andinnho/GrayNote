import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <linearGradient id="alienGradient" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#4B5563" />
        </linearGradient>
      </defs>

      {/* Outer Ring */}
      <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
      <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="2" className="text-primary opacity-50" />

      {/* Alien Head */}
      <path
        d="M100 170 C 145 170, 165 125, 165 90 C 165 40, 135 20, 100 20 C 65 20, 35 40, 35 90 C 35 125, 55 170, 100 170 Z"
        fill="url(#alienGradient)"
      />

      {/* Brain Pattern (Circuit style) */}
      <path d="M100 30 V 50" stroke="#1ABC9C" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M85 35 C 80 45, 90 55, 80 65" stroke="#1ABC9C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M115 35 C 120 45, 110 55, 120 65" stroke="#1ABC9C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="100" cy="40" r="2" fill="#1ABC9C" />

      {/* Eyes */}
      <ellipse cx="70" cy="95" rx="18" ry="28" fill="black" transform="rotate(25 70 95)" />
      <ellipse cx="130" cy="95" rx="18" ry="28" fill="black" transform="rotate(-25 130 95)" />
      
      {/* Eye Reflections */}
      <ellipse cx="75" cy="85" rx="3" ry="5" fill="white" transform="rotate(25 75 85)" opacity="0.7" />
      <ellipse cx="125" cy="85" rx="3" ry="5" fill="white" transform="rotate(-25 125 85)" opacity="0.7" />

      {/* Small Mouth */}
      <path d="M92 145 Q 100 148, 108 145" stroke="#374151" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
};