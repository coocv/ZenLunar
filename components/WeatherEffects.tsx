import React, { useEffect, useState } from 'react';

interface WeatherEffectsProps {
  season: 'spring' | 'summer' | 'autumn' | 'winter' | 'none';
  enabled: boolean;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ season, enabled }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle window resize to adjust particle counts and sizes
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Init
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (season === 'none') return null;

  // Determine scale factors based on screen width
  const isDesktop = dimensions.width >= 1024;
  const isTablet = dimensions.width >= 768 && dimensions.width < 1024;

  // Configuration based on device size
  const config = {
    spring: {
      count: isDesktop ? 60 : isTablet ? 40 : 25, 
      // Significantly reduced sizes
      sizeMin: isDesktop ? 8 : 6, 
      sizeMax: isDesktop ? 18 : 12,
    },
    summer: {
      glareSize: isDesktop ? 1200 : 800,
      count: isDesktop ? 35 : isTablet ? 25 : 15,
      sizeMin: isDesktop ? 10 : 6,
      sizeMax: isDesktop ? 24 : 16,
    },
    autumn: {
      count: isDesktop ? 40 : isTablet ? 25 : 15,
      sizeMin: isDesktop ? 24 : 18, 
      sizeMax: isDesktop ? 38 : 28,
    },
    winter: {
      count: isDesktop ? 100 : isTablet ? 50 : 25,
      sizeMin: isDesktop ? 12 : 8, 
      sizeMax: isDesktop ? 32 : 20,
    }
  };

  // Autumn color palette
  const autumnColors = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#b45309', // amber-700
    '#78350f'  // amber-900
  ];

  // Summer color palette (Fresh Greens)
  const summerColors = [
    '#86efac', // green-300
    '#4ade80', // green-400
    '#22c55e', // green-500
    '#16a34a', // green-600
    '#15803d', // green-700
  ];

  return (
    <>
      {/* 1. Atmospheric Gradient Layer (Background: z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out" aria-hidden="true">
        {season === 'spring' && (
          <div className="absolute inset-0 bg-gradient-to-b from-green-100/60 via-pink-50/40 to-white/0 mix-blend-multiply" />
        )}
        {season === 'summer' && (
           <div className="absolute inset-0 bg-gradient-to-br from-orange-100/60 via-yellow-50/40 to-white/0 mix-blend-multiply" />
        )}
        {season === 'autumn' && (
           <div className="absolute inset-0 bg-gradient-to-b from-amber-100/60 via-orange-50/40 to-white/0 mix-blend-multiply" />
        )}
        {season === 'winter' && (
           <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 via-slate-100/30 to-white/0 mix-blend-multiply" />
        )}
      </div>

      {/* 2. Particle Animation Layer (Foreground: z-20) - Falls OVER the calendar */}
      {enabled && dimensions.width > 0 && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden="true">
          {season === 'spring' && (
            // Real Sakura 🌸 (Small & Soft Pink)
            <div className="absolute inset-0">
              {[...Array(config.spring.count)].map((_, i) => {
                const depth = Math.random();
                const size = config.spring.sizeMin + (depth * (config.spring.sizeMax - config.spring.sizeMin));
                
                let blurClass = '';
                if (depth < 0.2) blurClass = 'blur-[1px]';
                else if (depth < 0.5) blurClass = 'blur-[0.5px]';
                else blurClass = 'blur-0';

                const opacity = 0.8 + (depth * 0.2);
                const speed = 10 + ((1 - depth) * 15) + (Math.random() * 5);
                const leftPos = Math.random() * 100;

                return (
                  <div 
                    key={i}
                    className={`absolute ${blurClass}`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `${leftPos}%`,
                      top: '-50px',
                      animationName: 'weather-fall-sakura',
                      animationDuration: `${speed}s`,
                      animationTimingFunction: 'linear',
                      animationDelay: `${Math.random() * 15}s`,
                      animationIterationCount: 'infinite',
                      opacity: opacity,
                      zIndex: Math.floor(depth * 20),
                    }}
                  >
                     <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
                        <g transform="translate(50,50)">
                           {/* 5 Petals: Soft Pink (#ffb7c5 - Cherry Blossom Pink) */}
                           {[0, 72, 144, 216, 288].map((angle, idx) => (
                             <path 
                                key={`p-${idx}`}
                                d="M0,0 C-10,-15 -25,-20 -25,-40 C-25,-55 -8,-60 0,-45 C8,-60 25,-55 25,-40 C25,-20 10,-15 0,0 Z" 
                                fill="#ffb7c5" 
                                transform={`rotate(${angle}) translate(0, -6)`}
                             />
                           ))}

                           {/* Center: Light Yellow */}
                           <circle cx="0" cy="0" r="14" fill="#fff9c4" />
                        </g>
                     </svg>
                  </div>
                );
              })}
            </div>
          )}

          {season === 'summer' && (
            <>
              {/* Sun glare */}
              <div 
                className="absolute top-[-10%] right-[-10%] bg-yellow-400/30 rounded-full blur-[100px] animate-pulse-slow"
                style={{
                  width: `${config.summer.glareSize}px`,
                  height: `${config.summer.glareSize}px`,
                }}
              ></div>

              {/* Green Leaves blowing in wind (Top-Right to Bottom-Left) */}
              <div className="absolute inset-0">
                {[...Array(config.summer.count)].map((_, i) => {
                  const depth = Math.random(); 
                  const size = config.summer.sizeMin + (depth * (config.summer.sizeMax - config.summer.sizeMin));
                  const color = summerColors[Math.floor(Math.random() * summerColors.length)];
                  const isFlipped = Math.random() > 0.5;
                  const topPos = Math.random() * 140 - 40; 

                  let blurClass = '';
                  if (depth < 0.3) blurClass = 'blur-[1.5px]';
                  else if (depth < 0.7) blurClass = 'blur-[0.5px]';
                  else blurClass = 'blur-0';

                  const opacity = 0.6 + (depth * 0.4);
                  const speed = 6 + ((1 - depth) * 6) + (Math.random() * 2);

                  return (
                    <div 
                      key={i}
                      className={`absolute animate-weather-wind-diagonal ${blurClass}`}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        left: '110%', 
                        top: `${topPos}%`, 
                        color: color,
                        animationDuration: `${speed}s`,
                        animationDelay: `${Math.random() * 10}s`,
                        opacity: opacity,
                        zIndex: Math.floor(depth * 10),
                        transform: isFlipped ? 'scaleX(-1)' : 'none'
                      }}
                    >
                       <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm filter overflow-visible">
                          <g fill="currentColor">
                            <path d="M12 2C17 5 21 10 21 15C21 19 17 22.5 12 22.5C7 22.5 3 19 3 15C3 10 7 5 12 2Z" />
                            <path d="M12 22.5V5 M12 18L17 15 M12 14L18 11 M12 10L17 7 M12 18L7 15 M12 14L6 11 M12 10L7 7" 
                                  stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                          </g>
                       </svg>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {season === 'autumn' && (
            // Falling Leaves (Only Oval)
            <div className="absolute inset-0">
              {[...Array(config.autumn.count)].map((_, i) => {
                const size = Math.random() * (config.autumn.sizeMax - config.autumn.sizeMin) + config.autumn.sizeMin;
                const color = autumnColors[Math.floor(Math.random() * autumnColors.length)];
                const isFlipped = Math.random() > 0.5;

                return (
                  <div 
                    key={i}
                    className="absolute animate-weather-fall-rotate"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `${Math.random() * 100}%`,
                      top: '-10%',
                      color: color,
                      animationDuration: `${10 + Math.random() * 10}s`,
                      animationDelay: `${Math.random() * 8}s`,
                      opacity: 0.9,
                      transform: isFlipped ? 'scaleX(-1)' : 'none'
                    }}
                  >
                     <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm filter overflow-visible">
                        <g fill="currentColor">
                          <path d="M12 2C17 5 21 10 21 15C21 19 17 22.5 12 22.5C7 22.5 3 19 3 15C3 10 7 5 12 2Z" />
                          <path d="M12 22.5V5 M12 18L17 15 M12 14L18 11 M12 10L17 7 M12 18L7 15 M12 14L6 11 M12 10L7 7" 
                                stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        </g>
                     </svg>
                  </div>
                );
              })}
            </div>
          )}

          {season === 'winter' && (
            // Snowflakes
            <div className="absolute inset-0">
              {[...Array(config.winter.count)].map((_, i) => {
                const fontSize = Math.random() * (config.winter.sizeMax - config.winter.sizeMin) + config.winter.sizeMin;
                
                const animType = Math.random();
                let animationName = 'weather-snow-sway';
                if (animType > 0.7) animationName = 'weather-snow-left';
                else if (animType > 0.4) animationName = 'weather-snow-right';

                const isFar = fontSize < 20;
                const opacity = isFar ? (0.4 + Math.random() * 0.3) : (0.8 + Math.random() * 0.2);
                const blur = isFar ? 'blur-[1px]' : '';

                return (
                  <div 
                    key={i}
                    className={`absolute text-white select-none font-bold ${blur}`}
                    style={{
                      fontSize: `${fontSize}px`,
                      left: `${Math.random() * 100}%`,
                      top: '-60px',
                      animationName: animationName,
                      animationDuration: `${8 + Math.random() * 14}s`,
                      animationTimingFunction: 'linear',
                      animationDelay: `${Math.random() * 15}s`,
                      animationIterationCount: 'infinite',
                      opacity: opacity,
                      textShadow: isFar ? 'none' : '0 0 4px rgba(186, 230, 253, 0.95), 0 0 8px rgba(255, 255, 255, 0.5)',
                      transformOrigin: 'center',
                    }}
                  >
                    ❄
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      <style>{`
        /* General Fall */
        @keyframes weather-fall {
          0% { transform: translateY(-10vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.9; }
          100% { transform: translateY(110vh) translateX(30px); opacity: 0; }
        }

        /* Sakura: Drifting and tumbling (Gentle Sway) */
        @keyframes weather-fall-sakura {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          25% { transform: translateY(20vh) translateX(20px) rotate(45deg); }
          50% { transform: translateY(50vh) translateX(-20px) rotate(0deg); }
          75% { transform: translateY(80vh) translateX(20px) rotate(-45deg); }
          100% { transform: translateY(110vh) translateX(0) rotate(-90deg); opacity: 0; }
        }

        /* Rotation Fall (Autumn) */
        @keyframes weather-fall-rotate {
          0% { transform: translateY(-10vh) rotate(0deg) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg) translateX(50px); opacity: 0; }
        }

        /* Summer Wind: Diagonal (Top-Right to Bottom-Left) */
        @keyframes weather-wind-diagonal {
          0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateX(-130vw) translateY(130vh) rotate(-540deg); 
            opacity: 0; 
          }
        }

        @keyframes weather-snow-sway {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          25% { transform: translateY(20vh) translateX(15px) rotate(45deg); }
          50% { transform: translateY(50vh) translateX(-15px) rotate(0deg); }
          75% { transform: translateY(80vh) translateX(15px) rotate(-45deg); }
          100% { transform: translateY(110vh) translateX(0) rotate(0deg); opacity: 0; }
        }

        @keyframes weather-snow-left {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) translateX(-15vw) rotate(-180deg); opacity: 0; }
        }

        @keyframes weather-snow-right {
          0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) translateX(15vw) rotate(180deg); opacity: 0; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        .animate-weather-fall {
          animation-name: weather-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-weather-fall-sakura {
          animation-name: weather-fall-sakura;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-weather-fall-rotate {
          animation-name: weather-fall-rotate;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-weather-wind-diagonal {
          animation-name: weather-wind-diagonal;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};