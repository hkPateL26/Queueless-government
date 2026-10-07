import React from 'react';

interface GovLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const GovLogo: React.FC<GovLogoProps> = ({ 
  className = "w-10 h-10", 
  size,
  showText = false 
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
        style={size ? { width: size, height: size } : undefined}
      >
        <defs>
          <linearGradient id="govGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9D423" />
            <stop offset="40%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#D48806" />
          </linearGradient>
          <linearGradient id="navyRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#002244" />
            <stop offset="50%" stopColor="#003366" />
            <stop offset="100%" stopColor="#001a33" />
          </linearGradient>
          <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#FF6600" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#138808" />
            <stop offset="100%" stopColor="#0D5C06" />
          </linearGradient>
          <radialGradient id="sunburst" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9E6" />
            <stop offset="85%" stopColor="#FFF0B3" />
            <stop offset="100%" stopColor="#FFE082" />
          </radialGradient>
        </defs>

        {/* Outer Circular Shield / Seal */}
        <circle cx="60" cy="60" r="58" fill="url(#navyRing)" stroke="url(#govGoldGrad)" strokeWidth="3" />
        <circle cx="60" cy="60" r="53" fill="none" stroke="url(#govGoldGrad)" strokeWidth="1" strokeDasharray="3 2" />

        {/* Inner Golden Ring */}
        <circle cx="60" cy="60" r="49" fill="url(#sunburst)" stroke="#003366" strokeWidth="1.5" />

        {/* Tricolor Arc Accents (Top Saffron, Bottom Green) */}
        <path d="M 20 60 A 40 40 0 0 1 100 60" fill="none" stroke="url(#saffronGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
        <path d="M 20 60 A 40 40 0 0 0 100 60" fill="none" stroke="url(#greenGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

        {/* Ashoka Stambh / 3 Lions Capital Stylized Emblem Motif */}
        {/* Central Pedestal / Abacus */}
        <rect x="42" y="69" width="36" height="5.5" rx="1.5" fill="#003366" />
        <rect x="40" y="74.5" width="40" height="3" rx="1" fill="url(#govGoldGrad)" />

        {/* Ashoka Chakra in Center of Abacus */}
        <circle cx="60" cy="71.75" r="2.5" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
        <circle cx="60" cy="71.75" r="0.6" fill="#FFFFFF" />

        {/* Center Lion Profile */}
        <path
          d="M 52 46 C 52 38, 68 38, 68 46 C 68 49, 66 52, 66 56 C 67 59, 68 62, 67 69 L 53 69 C 52 62, 53 59, 54 56 C 54 52, 52 49, 52 46 Z"
          fill="#003366"
        />
        {/* Lion Mane details */}
        <path d="M 54 44 C 54 39, 60 36, 66 44 C 64 42, 60 41, 56 43 Z" fill="url(#govGoldGrad)" />
        <path d="M 56 50 C 57 48, 63 48, 64 50" stroke="url(#govGoldGrad)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 57 55 C 58 53, 62 53, 63 55" stroke="url(#govGoldGrad)" strokeWidth="1" strokeLinecap="round" />
        {/* Lion Muzzle / Eyes */}
        <circle cx="58" cy="46" r="0.9" fill="#FFFFFF" />
        <circle cx="62" cy="46" r="0.9" fill="#FFFFFF" />
        <path d="M 59 49 L 61 49 L 60 51 Z" fill="url(#govGoldGrad)" />

        {/* Left Guard Lion Silhouette */}
        <path
          d="M 44 50 C 44 43, 52 42, 53 47 C 51 51, 51 56, 52 69 L 43 69 C 42 62, 42 56, 44 50 Z"
          fill="#002244"
          opacity="0.92"
        />
        <path d="M 45 47 C 46 44, 49 43, 51 46" stroke="url(#govGoldGrad)" strokeWidth="1" strokeLinecap="round" />

        {/* Right Guard Lion Silhouette */}
        <path
          d="M 76 50 C 76 43, 68 42, 67 47 C 69 51, 69 56, 68 69 L 77 69 C 78 62, 78 56, 76 50 Z"
          fill="#002244"
          opacity="0.92"
        />
        <path d="M 75 47 C 74 44, 71 43, 69 46" stroke="url(#govGoldGrad)" strokeWidth="1" strokeLinecap="round" />

        {/* 24-Spoke Central Ashoka Chakra Motif (Background watermark) */}
        <g opacity="0.12" stroke="#003366" strokeWidth="1">
          <circle cx="60" cy="55" r="22" fill="none" strokeWidth="1.5" />
          <line x1="60" y1="33" x2="60" y2="77" />
          <line x1="38" y1="55" x2="82" y2="55" />
          <line x1="44.4" y1="39.4" x2="75.6" y2="70.6" />
          <line x1="44.4" y1="70.6" x2="75.6" y2="39.4" />
        </g>

        {/* Bottom Banner Ribbon */}
        <path
          d="M 28 85 L 36 80 L 84 80 L 92 85 L 86 91 L 84 88 L 36 88 L 34 91 Z"
          fill="url(#govGoldGrad)"
          stroke="#003366"
          strokeWidth="0.8"
        />

        {/* "સત્યમેવ જયતે" Text in Ribbon */}
        <text
          x="60"
          y="85.5"
          textAnchor="middle"
          fontSize="5.2"
          fontWeight="900"
          fontFamily="'Gujarati MT', 'Shruti', 'Noto Sans Gujarati', 'Mukta Vaani', sans-serif"
          fill="#002244"
          letterSpacing="0.2"
        >
          સત્યમેવ જયતે
        </text>

        {/* Top Arc Text: "ગુજરાત સરકાર • GOVT OF GUJARAT" */}
        <path id="curveTop" d="M 22 55 A 41 41 0 0 1 98 55" fill="none" />
        <text fontSize="4.2" fontWeight="900" fill="#FFE082" letterSpacing="0.5">
          <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
            ગુજરાત સરકાર • GOVT OF GUJARAT
          </textPath>
        </text>

        {/* Bottom Arc Text: "નાગરિક સેવા આયોગ" */}
        <path id="curveBottom" d="M 96 68 A 41 41 0 0 1 24 68" fill="none" />
        <text fontSize="3.8" fontWeight="800" fill="#FFF9E6" letterSpacing="0.6">
          <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
            ★ જન સેવા કેન્દ્ર • QUEUELESS ★
          </textPath>
        </text>

        {/* Small flanking decorative wheat/laurel stars */}
        <polygon points="17,58 18.5,55 20,58 17,56 20,56" fill="url(#govGoldGrad)" />
        <polygon points="100,58 101.5,55 103,58 100,56 103,56" fill="url(#govGoldGrad)" />
      </svg>
    </div>
  );
};
