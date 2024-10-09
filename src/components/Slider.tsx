import React, { useState, useRef, useEffect, useMemo } from "react";

interface SliderProps {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (name: string, value: number) => void;
  colorScheme: string[];
  index: number;
}

const Slider: React.FC<SliderProps> = ({
  name,
  label,
  min,
  max,
  step,
  value,
  onChange,
  colorScheme,
  index,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Determine the number of decimal places based on the step
  const decimalPlaces = useMemo(
    () => Math.max(0, -Math.floor(Math.log10(step))),
    [step]
  );

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartY("touches" in e ? e.touches[0].clientY : e.clientY);
    setStartValue(value);
    window.isInteractingWithUI = true;
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaY = startY - clientY;
      const deltaValue = (deltaY / 100) * (max - min);
      const newValue = Math.max(min, Math.min(max, startValue + deltaValue));

      // Round the new value to the nearest step
      const steppedValue = Math.round(newValue / step) * step;

      // Ensure the value is within the min-max range
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      onChange(name, parseFloat(clampedValue.toFixed(decimalPlaces)));
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    window.isInteractingWithUI = false;
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

  const bgColor = colorScheme[index % colorScheme.length];
  const fillPercentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={sliderRef}
      className="relative w-12 h-16 touch-none font-mono text-center cursor-ns-resize border border-black select-none"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: bgColor,
          height: `${fillPercentage}%`,
          transition: "height 0.1s ease-out",
        }}
      ></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* <div className="text-sm font-bold">{value.toFixed(2)}</div> */}
        <div className="text-xs mt-1">{label}</div>
      </div>
    </div>
  );
};

export default Slider;
