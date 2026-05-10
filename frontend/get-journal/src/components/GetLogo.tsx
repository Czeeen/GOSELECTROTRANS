import React from 'react';

export const GetLogo: React.FC = () => {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#009CBC" />
          <stop offset="100%" stopColor="#007A99" />
        </linearGradient>
        <linearGradient id="grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E4032E" />
          <stop offset="100%" stopColor="#B80224" />
        </linearGradient>
        <linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#24305E" />
          <stop offset="100%" stopColor="#1A2345" />
        </linearGradient>
      </defs>
      
      <polyline 
        points="35,20 55,50 35,80" 
        fill="none" 
        stroke="url(#grad-cyan)" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      <polyline 
        points="58,20 78,50 58,80" 
        fill="none" 
        stroke="url(#grad-red)" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      <line 
        x1="15" y1="25" 
        x2="50" y2="75" 
        stroke="url(#grad-blue)" 
        strokeWidth="7" 
        strokeLinecap="round"
      />

      <line 
        x1="32" y1="25" 
        x2="67" y2="75" 
        stroke="url(#grad-blue)" 
        strokeWidth="7" 
        strokeLinecap="round"
      />
    </svg>
  );
};