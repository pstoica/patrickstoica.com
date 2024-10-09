import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import Slider from "./Slider";

declare global {
  interface Window {
    updateSketchParams: (newParams: any) => void;
    isInteractingWithUI: boolean;
  }
}

interface Params {
  smoothness: number;
  gradientLength: number;
  baseShiftSpeed: number;
  minBrushWidth: number;
  maxBrushWidth: number;
  globalSizeFrequency: number;
  sizeFrequency: number;
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
    globalSizeFrequency: 0.05,
    sizeFrequency: 2.0,
    rippleFrequency: 0.0,
    rippleAmplitude: 0.0,
    rippleSpeed: 0.5,
  });

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toggleSettings = () => {
      setIsVisible(!isVisible);
    };
    window.addEventListener("toggleSettings", toggleSettings);
    return () => window.removeEventListener("toggleSettings", toggleSettings);
  }, [isVisible]);

  useEffect(() => {
    window.isInteractingWithUI = false;
  }, []);

  useEffect(() => {
    if (window.updateSketchParams) {
      window.updateSketchParams(params);
    }
  }, [params]);

  const handleChange = (name: keyof Params, value: number) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleInteractionStart = () => {
    window.isInteractingWithUI = true;
  };

  const handleInteractionEnd = () => {
    window.isInteractingWithUI = false;
  };

  const colorScheme = [
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#45B7D1", // Light Blue
    "#FFA07A", // Light Salmon
    "#98D8C8", // Mint
    "#F7DC6F", // Yellow
    "#BB8FCE", // Light Purple
    "#82E0AA", // Light Green
  ];

  if (!isVisible) return null;

  return (
    <Draggable
      handle=".handle"
      nodeRef={panelRef}
      onStart={handleInteractionStart}
      onStop={handleInteractionEnd}
      defaultPosition={{ x: 20, y: 0 }}
    >
      <div
        ref={panelRef}
        className="fixed bottom-16 left-0 right-0 bg-white p-2 z-50 border border-black"
        style={{
          maxHeight: "70vh",
          maxWidth: "30vw",
          overflowY: "auto",
        }}
      >
        <div className="handle cursor-move mb-2 text-center font-bold text-black text-sm font-mono border-b border-black pb-2">
          Settings
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Slider
            name="smoothness"
            label="Density"
            min={0.01}
            max={0.2}
            step={0.01}
            value={params.smoothness}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={0}
          />
          <Slider
            name="gradientLength"
            label="Gradient Length"
            min={100}
            max={1000}
            step={10}
            value={params.gradientLength}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={1}
          />
          <Slider
            name="baseShiftSpeed"
            label="Base Shift Speed"
            min={0}
            max={40}
            step={0.01}
            value={params.baseShiftSpeed}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={2}
          />
          <Slider
            name="minBrushWidth"
            label="Min Brush Width"
            min={0}
            max={50}
            step={1}
            value={params.minBrushWidth}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={3}
          />
          <Slider
            name="maxBrushWidth"
            label="Max Brush Width"
            min={10}
            max={200}
            step={0.1}
            value={params.maxBrushWidth}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={4}
          />
          <Slider
            name="globalSizeFrequency"
            label="Global Size Freq"
            min={0}
            max={2}
            step={0.001}
            value={params.globalSizeFrequency}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={5}
          />
          <Slider
            name="sizeFrequency"
            label="Size Freq"
            min={0}
            max={20}
            step={0.01}
            value={params.sizeFrequency}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={6}
          />
          {/* <Slider
            name="rippleFrequency"
            label="Ripple Freq"
            min={0}
            max={2}
            step={0.01}
            value={params.rippleFrequency}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={7}
          />
          <Slider
            name="rippleAmplitude"
            label="Ripple Amp"
            min={0}
            max={2}
            step={0.01}
            value={params.rippleAmplitude}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={8}
          />
          <Slider
            name="rippleSpeed"
            label="Ripple Speed"
            min={0}
            max={2}
            step={0.01}
            value={params.rippleSpeed}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={9}
          /> */}
        </div>
      </div>
    </Draggable>
  );
};

// Helper function to get the max value for each parameter
const getMaxValue = (name: string): number => {
  switch (name) {
    case "gradientLength":
      return 1000;
    case "maxBrushWidth":
      return 200;
    case "baseShiftSpeed":
      return 40;
    case "sizeFrequency":
      return 20;
    default:
      return 2;
  }
};

export default SettingsPanel;
