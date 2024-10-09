import React, { useState, useRef, useEffect } from "react";

interface SliderProps {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (name: string, value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  name,
  label,
  min,
  max,
  step,
  value,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleInteraction = (clientX: number) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const newValue =
        Number(min) + (x / rect.width) * (Number(max) - Number(min));
      const clampedValue = Math.max(
        Number(min),
        Math.min(Number(max), newValue)
      );
      onChange(name, parseFloat(clampedValue.toFixed(2)));
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if ("touches" in e) {
      handleInteraction(e.touches[0].clientX);
    } else {
      handleInteraction(e.clientX);
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      handleInteraction(clientX);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMove, { passive: false });
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className="relative h-12 mb-1 touch-none font-mono"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div className="absolute w-full h-12 bg-white border border-black rounded">
        <div
          className="h-full bg-gray-200 rounded-l"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div
        className="absolute left-0 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-white border border-black rounded text-black text-xs transition-opacity duration-200 whitespace-nowrap overflow-hidden select-none"
        style={{
          left: `${percentage}%`,
          transform: `translate(-50%, -50%)`,
          opacity: isDragging ? 1 : 0.9,
          maxWidth: "80%",
        }}
      >
        {label}: {value.toFixed(2)}
      </div>
    </div>
  );
};

export default Slider;
