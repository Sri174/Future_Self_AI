import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      width="100"
      height="100"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00aeef" />
          <stop offset="100%" stopColor="#00a651" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#grad1)" stroke="#FFC700" strokeWidth="4" />
      <path
        d="M30 65 Q 50 20, 70 65"
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M35 40 L 50 55 L 65 40"
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="50" cy="25" r="5" fill="#FFC700" />
    </svg>
  );
};

export default Logo;
