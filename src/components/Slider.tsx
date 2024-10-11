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
  onChange: (name: string, value: number) => void;
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
    onChange(name, newValue);
  };

  const bgColor = colorScheme[index % colorScheme.length];

  return (
    <div
      className={`relative text-xs w-12 h-12 md:text-base md:w-24 md:h-24 touch-none font-mono text-center cursor-ns-resize border ${
        isDarkMode
          ? "border-gray-800 text-gray-200"
          : "border-gray-200 text-gray-800"
      } select-none`}
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
        <KnobBaseThumb
          theme={bgColor}
          value01={(valueRaw - min) / (max - min)}
        />
      </KnobHeadless>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <KnobHeadlessOutput
          htmlFor={knobId}
          className={`flex flex-col items-center justify-end mt-1 lowercase ${
            isDarkMode ? "text-gray-200" : "text-gray-800"
          }`}
          // style={{
          //   textShadow: isDarkMode
          //     ? "0 2px 2px rgba(0,0,0,1)"
          //     : "0 0px 2px rgba(255,255,255,1)",
          // }}
        >
          {label.split(" ").map((word, index) => (
            <span key={index} className="block ">
              {word}
            </span>
          ))}
        </KnobHeadlessOutput>
      </div>
    </div>
  );
};

export default Slider;
