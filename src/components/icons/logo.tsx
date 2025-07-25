import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <g transform="translate(5, 5) scale(0.9)">
        {/* <!-- Green Figure --> */}
        <path d="M45,75 C30,75 20,60 25,45 C30,30 45,20 50,30" stroke="#00A651" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="40" r="8" fill="#00A651" />
        
        {/* <!-- Light Blue Figure --> */}
        <path d="M55,75 C70,75 80,60 75,45 C70,30 55,20 50,30" stroke="#00AEEF" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="72" cy="40" r="8" fill="#00AEEF" />
        
        {/* <!-- Yellow Figure --> */}
        <path d="M50,25 C40,40 60,40 50,25" stroke="#FFC700" strokeWidth="8" fill="none" strokeLinecap="round" visibility="hidden" />
        <path d="M35 55 C 40 45, 60 45, 65 55" stroke="#FFC700" strokeWidth="8" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="45" r="8" fill="#FFC700" />

        {/* <!-- Stars --> */}
        <polygon points="50,5 54,13 62,13 56,18 58,26 50,21 42,26 44,18 38,13 46,13" fill="#00A651" />
        <polygon points="65,15 67,21 73,21 69,25 70,31 65,28 60,31 61,25 57,21 63,21" fill="#00AEEF" transform="scale(0.8) translate(15, -5)" />
        <polygon points="35,15 37,21 43,21 39,25 40,31 35,28 30,31 31,25 27,21 33,21" fill="#FFC700" transform="scale(0.6) translate(-20, 0)" />
      </g>
    </svg>
  );
};

export default Logo;
