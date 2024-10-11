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
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
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
    if (isVisible && panelRef.current) {
      const panelWidth = panelRef.current.offsetWidth;
      const panelHeight = panelRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      setPosition({
        x: (windowWidth - panelWidth) / 2,
        y: -panelHeight - 50, // Set a fixed Y position near the top
      });
    }
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
    window.isInteractingWithUI = true;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleInteractionStart = () => {
    window.isInteractingWithUI = true;
  };

  const handleInteractionEnd = () => {
    window.isInteractingWithUI = false;
  };

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
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
      position={position}
      onDrag={handleDrag}
      onStart={handleInteractionStart}
      onStop={handleInteractionEnd}
    >
      <div
        ref={panelRef}
        className="fixed bg-white pb-1 px-1 z-50 border border-black"
        style={{
          maxHeight: "70vh",
          maxWidth: "100vw",
          overflowY: "auto",
        }}
      >
        <div className="handle cursor-move mb-0.5 text-center text-black uppercase font-mono border-b border-black">
          :::::::
        </div>

        <div className="border-t border-dotted border-black pt-1 grid grid-rows-1 grid-cols-7 gap-1">
          <Slider
            name="smoothness"
            label="Drawing Density"
            min={0.01}
            max={40}
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
            label="Color Density"
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
            label="Color Phase"
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
            label="Min Size"
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
            label="Max Size"
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
          <Slider
            name="globalSizeFrequency"
            label="Size Phase"
            min={0}
            max={0.5}
            step={0.01}
            value={params.globalSizeFrequency}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={5}
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

export default SettingsPanel;
