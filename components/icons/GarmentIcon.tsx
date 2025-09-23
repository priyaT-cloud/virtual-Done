import React from 'react';

export const GarmentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 3.75V16.5L12 14.25L7.5 16.5V3.75m9 0H7.5A2.25 2.25 0 005.25 6v13.5A2.25 2.25 0 007.5 21.75h9a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0016.5 3.75z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7.5h6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5h6" />
  </svg>
);
