import React, { useId, useState, useMemo } from "react";
import {
  KnobHeadless,
  KnobHeadlessLabel,
  KnobHeadlessOutput,
  useKnobKeyboardControls,
} from "react-knob-headless";
import { mapFrom01Linear, mapTo01Linear } from "@dsp-ts/math";
import { KnobBaseThumb } from "./KnobBaseThumb";

interface SliderProps {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  colorScheme: string[];
  index: number;
  isDarkMode: boolean;
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
  isDarkMode,
}) => {
  const knobId = useId();
  const labelId = useId();
  const [valueRaw, setValueRaw] = useState<number>(value);

  const decimalPlaces = useMemo(
    () => Math.max(0, -Math.floor(Math.log10(step))),
    [step]
  );

  const valueRawRoundFn = (v: number) => Number(v.toFixed(decimalPlaces));
  const valueRawDisplayFn = (v: number) => v.toFixed(decimalPlaces);

  const stepFn = () => step;
  const stepLargerFn = () => step * 10;

  const keyboardControlHandlers = useKnobKeyboardControls({
    valueRaw,
    valueMin: min,
    valueMax: max,
    step,
    stepLarger: step * 10,
    onValueRawChange: setValueRaw,
  });

  const handleValueChange = (newValue: number) => {
    setValueRaw(newValue);
    onChange(newValue);
  };

  const bgColor = colorScheme[index % colorScheme.length];

  // Function to determine if a color is light or dark
  const isLightColor = (color: string) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Determine contrasting color based on background
  const contrastColor = isLightColor(bgColor) ? "#000000" : "#FFFFFF";

  const value01 = (valueRaw - min) / (max - min);

  return (
    <div
      className={`relative text-xs w-12 h-12 md:text-base md:w-24 md:h-24 touch-none font-mono text-center cursor-ns-resize border dark:border-gray-800 dark:text-gray-200 border-gray-200 text-gray-800 select-none`}
    >
      <KnobHeadlessLabel id={labelId} className="sr-only">
        {label}
      </KnobHeadlessLabel>
      <KnobHeadless
        id={knobId}
        aria-labelledby={labelId}
        className="w-full h-full outline-none"
        valueMin={min}
        valueMax={max}
        valueRaw={valueRaw}
        valueRawRoundFn={valueRawRoundFn}
        valueRawDisplayFn={valueRawDisplayFn}
        dragSensitivity={0.006}
        orientation="vertical"
        mapTo01={mapTo01Linear}
        mapFrom01={mapFrom01Linear}
        onValueRawChange={handleValueChange}
        {...keyboardControlHandlers}
      >
        <KnobBaseThumb theme={bgColor} value01={value01} />
      </KnobHeadless>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
        <KnobHeadlessOutput
          htmlFor={knobId}
          className="flex flex-col items-center justify-end mt-1 lowercase relative w-full h-full"
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
          >
            {label.split(" ").map((word, index) => (
              <span key={index} className="block">
                {word}
              </span>
            ))}
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              color: contrastColor,
              clipPath: `inset(${97 - value01 * 100}% 0 0 0)`,
              backgroundColor: bgColor,
            }}
          >
            {label.split(" ").map((word, index) => (
              <span key={index} className="block">
                {word}
              </span>
            ))}
          </div>
        </KnobHeadlessOutput>
      </div>
    </div>
  );
};

export default Slider;
