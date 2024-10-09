import React from "react";

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
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLInputElement>
      | React.TouchEvent<HTMLInputElement>
  ) => {
    const input = e.currentTarget;
    let newValue: number;

    if ("touches" in e) {
      // Touch event
      const rect = input.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      newValue = Number(min) + (x / rect.width) * (Number(max) - Number(min));
    } else if ("clientX" in e) {
      // Mouse event
      const rect = input.getBoundingClientRect();
      const x = e.clientX - rect.left;
      newValue = Number(min) + (x / rect.width) * (Number(max) - Number(min));
    } else {
      // Regular change event
      newValue = parseFloat(input.value);
    }

    // Clamp the value to the min-max range
    newValue = Math.max(Number(min), Math.min(Number(max), newValue));
    onChange(name, newValue);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-2 text-white">
        {label}: {value.toFixed(2)}
      </label>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        onMouseDown={handleChange}
        onTouchStart={handleChange}
        className="w-full"
      />
    </div>
  );
};

export default Slider;
