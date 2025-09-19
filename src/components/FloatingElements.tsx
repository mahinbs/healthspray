import { useEffect, useState } from "react";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

const FloatingElements = () => {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    const generateElements = () => {
      const newElements: FloatingElement[] = [];
      for (let i = 0; i < 6; i++) {
        newElements.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 60 + 20,
          delay: Math.random() * 4,
          color: `hsl(${257 + Math.random() * 63}, 89%, 67%)`,
        });
      }
      setElements(newElements);
    };

    generateElements();
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute rounded-full opacity-20 animate-float"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            backgroundColor: element.color,
            animationDelay: `${element.delay}s`,
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;