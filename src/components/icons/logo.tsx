import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      {...props}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#grad1)" />
      <text
        x="50"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize="40"
        fill="hsl(var(--primary-foreground))"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="bold"
      >
        MV
      </text>
    </svg>
  );
};

export default Logo;
