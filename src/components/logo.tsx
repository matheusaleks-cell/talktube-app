
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 250 180"
      {...props}
    >
      <title>Talktube Logo</title>
      <g transform="translate(0, 20)">
        {/* Bottom "TALK" bubble */}
        <g>
          {/* Main body of the bubble */}
          <path
            d="M20,0 L180,0 A20,20 0 0 1 200,20 L200,80 A20,20 0 0 1 180,100 L40,100 L20,120 L20,20 A20,20 0 0 1 20,0"
            fill="#1E3A8A" // dark blue
            transform="skewY(-15) scale(1.1, 1)"
          />
          <text
            x="55"
            y="75"
            fontFamily="sans-serif"
            fontSize="50"
            fontWeight="bold"
            fill="white"
            transform="skewY(-15) scale(1.1, 1)"
          >
            TALK
          </text>
        </g>
        
        {/* Top "tube" bubble */}
        <g transform="translate(100, -50)">
          {/* Bubble shadow */}
          <path 
            d="M5,5 L95,5 A10,10 0 0 1 105,15 L105,45 A10,10 0 0 1 95,55 L25,55 L5,75 L5,15 A10,10 0 0 1 5,5"
            fill="black"
            opacity="0.1"
            transform="translate(3,3)"
          />
          {/* Bubble border */}
          <path 
            d="M5,5 L95,5 A10,10 0 0 1 105,15 L105,45 A10,10 0 0 1 95,55 L25,55 L5,75 L5,15 A10,10 0 0 1 5,5"
            fill="#7DD3FC" // light blue
          />
          {/* Bubble background */}
          <path
            d="M7,7 L93,7 A8,8 0 0 1 101,15 L101,45 A8,8 0 0 1 93,53 L24,53 L7,69 L7,15 A8,8 0 0 1 7,7"
            fill="white"
          />
          <text
            x="22"
            y="42"
            fontFamily="sans-serif"
            fontSize="30"
            fontWeight="bold"
            fill="black"
          >
            tube
          </text>
        </g>
      </g>
    </svg>
  );
}

    