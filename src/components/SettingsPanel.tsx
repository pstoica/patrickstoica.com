import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import Slider from "./Slider";

declare global {
  interface Window {
    updateSketchParams: (newParams: any) => void;
  }
}

interface Params {
  smoothness: number;
  gradientLength: number;
  baseShiftSpeed: number;
  minBrushWidth: number;
  maxBrushWidth: number;
  oscillationFrequency: number;
  drawingOscillationFrequency: number;
  rippleFrequency: number;
  rippleAmplitude: number;
  rippleSpeed: number;
}

const SettingsPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [params, setParams] = useState<Params>({
    smoothness: 0.05,
    gradientLength: 500,
    baseShiftSpeed: 4.0,
    minBrushWidth: 0,
    maxBrushWidth: 80,
    oscillationFrequency: 0.05,
    drawingOscillationFrequency: 2.0,
    rippleFrequency: 0.0,
    rippleAmplitude: 0.0,
    rippleSpeed: 0.5,
  });

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toggleSettings = () => setIsVisible(!isVisible);
    window.addEventListener("toggleSettings", toggleSettings);
    return () => window.removeEventListener("toggleSettings", toggleSettings);
  }, [isVisible]);

  useEffect(() => {
    if (window.updateSketchParams) {
      window.updateSketchParams(params);
    }
  }, [params]);

  const handleChange = (name: keyof Params, value: number) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const preventPropagation = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isVisible) return null;

  return (
    <Draggable handle=".handle" nodeRef={panelRef}>
      <div
        ref={panelRef}
        className="fixed top-10 left-10 bg-gray-800 p-4 rounded shadow-lg z-50"
        style={{
          minWidth: "300px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onMouseDown={preventPropagation}
        onTouchStart={preventPropagation}
        onTouchMove={preventPropagation}
        onTouchEnd={preventPropagation}
      >
        <div className="handle cursor-move mb-4 text-center font-bold text-white">
          Settings (Drag to move)
        </div>
        <Slider
          name="smoothness"
          label="Smoothness"
          min={0.01}
          max={0.2}
          step={0.01}
          value={params.smoothness}
          onChange={handleChange}
        />
        <Slider
          name="gradientLength"
          label="Gradient Length"
          min={100}
          max={1000}
          step={10}
          value={params.gradientLength}
          onChange={handleChange}
        />
        <Slider
          name="baseShiftSpeed"
          label="Base Shift Speed"
          min={0}
          max={10}
          step={0.01}
          value={params.baseShiftSpeed}
          onChange={handleChange}
        />
        <Slider
          name="minBrushWidth"
          label="Min Brush Width"
          min={0}
          max={50}
          step={1}
          value={params.minBrushWidth}
          onChange={handleChange}
        />
        <Slider
          name="maxBrushWidth"
          label="Max Brush Width"
          min={10}
          max={200}
          step={0.1}
          value={params.maxBrushWidth}
          onChange={handleChange}
        />
        <Slider
          name="oscillationFrequency"
          label="Oscillation Frequency"
          min={0}
          max={0.2}
          step={0.001}
          value={params.oscillationFrequency}
          onChange={handleChange}
        />
        <Slider
          name="drawingOscillationFrequency"
          label="Drawing Oscillation Frequency"
          min={0}
          max={5}
          step={0.01}
          value={params.drawingOscillationFrequency}
          onChange={handleChange}
        />

        {/* <Slider
          name="rippleFrequency"
          label="Ripple Frequency"
          min={0}
          max={0.1}
          step={0.001}
          value={params.rippleFrequency}
          onChange={handleChange}
        />
        <Slider
          name="rippleAmplitude"
          label="Ripple Amplitude"
          min={0}
          max={50}
          step={1}
          value={params.rippleAmplitude}
          onChange={handleChange}
        />
        <Slider
          name="rippleSpeed"
          label="Ripple Speed"
          min={0}
          max={2}
          step={0.1}
          value={params.rippleSpeed}
          onChange={handleChange}
        /> */}
      </div>
    </Draggable>
  );
};

export default SettingsPanel;
