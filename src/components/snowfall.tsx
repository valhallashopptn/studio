
'use client';

import React, { useEffect, useState } from 'react';

const Snowflake = ({ style }: { style: React.CSSProperties }) => {
  return (
    <div
      className="absolute rounded-full bg-white/80 animate-snowfall"
      style={style}
    ></div>
  );
};

export const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const createSnowflakes = () => {
      const newSnowflakes = Array.from({ length: 100 }).map((_, i) => {
        const size = Math.random() * 4 + 1;
        const style: React.CSSProperties = {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}vw`,
          top: "-10px",
          animationDelay: `${Math.random() * -20}s`,
          animationDuration: `${Math.random() * 10 + 10}s`,
          opacity: Math.random() * 0.5 + 0.5
        };
        return <Snowflake key={i} style={style} />;
      });
      setSnowflakes(newSnowflakes);
    };

    createSnowflakes();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-screen -z-10 pointer-events-none overflow-hidden">
      {snowflakes}
    </div>
  );
};
