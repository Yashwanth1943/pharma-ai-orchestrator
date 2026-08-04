
export const Logo = ({ className = '', size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
          <stop offset="100%" stopColor="#6366f1" /> {/* indigo-500 */}
        </linearGradient>
        <linearGradient id="secondaryGradient" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" /> {/* violet-500 */}
          <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Hexagon / Molecule Shape */}
      <path 
        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
        stroke="url(#primaryGradient)" 
        strokeWidth="6" 
        strokeLinejoin="round"
        fill="transparent"
      />

      {/* Internal AI Circuit / DNA Twist */}
      <path 
        d="M30 30 C 50 10, 50 90, 70 70" 
        stroke="url(#secondaryGradient)" 
        strokeWidth="5" 
        strokeLinecap="round"
      />
      <path 
        d="M30 70 C 50 90, 50 10, 70 30" 
        stroke="url(#primaryGradient)" 
        strokeWidth="5" 
        strokeLinecap="round"
      />

      {/* Center glowing core (AI Node) */}
      <circle cx="50" cy="50" r="10" fill="url(#secondaryGradient)" filter="url(#glow)" />
      
      {/* Accent Nodes */}
      <circle cx="30" cy="30" r="4" fill="#60a5fa" />
      <circle cx="70" cy="70" r="4" fill="#818cf8" />
      <circle cx="30" cy="70" r="4" fill="#a78bfa" />
      <circle cx="70" cy="30" r="4" fill="#60a5fa" />
    </svg>
  );
};
