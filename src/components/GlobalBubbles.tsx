import { useEffect, useState } from "react";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  colorVariant: number;
}

const GlobalBubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles: Bubble[] = [];
      for (let i = 0; i < 70; i++) {
        newBubbles.push({
          id: i,
          x: Math.random() * 120 - 10, // -10% to 110% for partial off-screen
          y: Math.random() * 120 - 10,
          size: Math.random() * 17 + 8, // 8px to 25px (small bubbles)
          delay: Math.random() * 30, // 0-30s delay for better staggering
          duration: Math.random() * 30 + 15, // 15-45 seconds for varied speeds
          opacity: Math.random() * 0.15 + 0.1, // 10-25% opacity (lower for many bubbles)
          colorVariant: Math.floor(Math.random() * 8), // 8 color variants
        });
      }
      setBubbles(newBubbles);
    };

    generateBubbles();
  }, []);

  const getColorClass = (variant: number) => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-pink-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-pink-500 to-orange-500',
      'bg-gradient-to-br from-green-500 to-teal-500',
      'bg-gradient-to-br from-yellow-500 to-red-500',
      'bg-gradient-to-br from-indigo-500 to-purple-500',
      'bg-gradient-to-br from-cyan-500 to-blue-500',
      'bg-gradient-to-br from-rose-500 to-pink-500'
    ];
    return colors[variant];
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`absolute rounded-full ${getColorClass(bubble.colorVariant)} animate-bubble-float`}
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            opacity: bubble.opacity,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
};

export default GlobalBubbles;