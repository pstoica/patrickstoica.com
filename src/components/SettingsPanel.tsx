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
  rotation: number;
  rotationRate: number;
  rotationWave: number;
  shape: number;
  shapeWave: number;
  shapeRate: number;
  fill: number;
  fillWave: number;
  fillRate: number;
}

export const colorSchemes = {
  iridescent: [
    "#FF1493",
    "#FF00FF",
    "#8A2BE2",
    "#4B0082",
    "#0000FF",
    "#00FFFF",
    "#00FF00",
    "#FFFF00",
  ],
  rainbow: [
    "#FF0000",
    "#FF7F00",
    "#FFFF00",
    "#00FF00",
    "#0000FF",
    "#4B0082",
    "#9400D3",
  ],
  warm: [
    "#FF6B6B",
    "#FFA07A",
    "#F7DC6F",
    "#FFD700",
    "#FFA500",
    "#FF8C00",
    "#FF7F50",
    "#FF6347",
  ],
  cool: [
    "#4ECDC4",
    "#45B7D1",
    "#6495ED",
    "#87CEEB",
    "#00CED1",
    "#40E0D0",
    "#48D1CC",
    "#20B2AA",
  ],
  grayscale: [
    "#000000",
    "#1A1A1A",
    "#333333",
    "#4D4D4D",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
  ],
};

export const defaultParams = {
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
  rotation: 0,
  rotationRate: 0,
  rotationWave: 0,
  shape: 0,
  shapeWave: 0,
  shapeRate: 0,
  fill: 1,
  fillWave: 0,
  fillRate: 0,
};

const mapTo01 = (value: number) => {
  if (value <= 0) return 0;
  if (value >= 0.5) return 1;
  return value * 2;
};

const mapFrom01 = (value: number) => {
  if (value <= 0) return 0;
  if (value >= 1) return 0.5;
  return value / 2;
};

const SettingsPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [params, setParams] = useState<Params>(defaultParams);

  const [colorScheme, setColorScheme] = useState(
    Object.values(colorSchemes)[0]
  );
  const [currentSchemeIndex, setCurrentSchemeIndex] = useState(0);

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

  const cycleColorScheme = (direction: "next" | "prev") => {
    const schemes = Object.values(colorSchemes);
    let newIndex;
    if (direction === "next") {
      newIndex = (currentSchemeIndex + 1) % schemes.length;
    } else {
      newIndex = (currentSchemeIndex - 1 + schemes.length) % schemes.length;
    }
    setCurrentSchemeIndex(newIndex);
    setColorScheme(schemes[newIndex]);

    // Update the p5js sketch color scheme
    if (window.updateSketchParams) {
      window.updateSketchParams({ colorScheme: schemes[newIndex] });
    }
  };

  const gradientStyle = {
    background: `linear-gradient(to right, ${colorScheme.join(", ")})`,
  };

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

        {/* First row of sliders */}
        <div className="border-t border-gray-500 border-dotted pt-1 grid grid-rows-1 grid-cols-7 gap-1">
          <Slider
            name="smoothness"
            label="Brush Density"
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
            label="Color Wave"
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
            label="Color Rate"
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
            label="Size Wave"
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
            label="Size Rate"
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
        </div>

        {/* Second row of sliders */}
        <div className="border-t border-gray-500 border-dotted pt-1 grid grid-rows-1 grid-cols-7 gap-1 mt-1">
          <Slider
            name="rotation"
            label="Rotation"
            min={0}
            max={360}
            step={1}
            value={params.rotation}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={7}
          />
          <Slider
            name="rotationWave"
            label="Rot Wave"
            min={0}
            max={360}
            step={1}
            value={params.rotationWave}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={8}
          />
          <Slider
            name="rotationRate"
            label="Rot Rate"
            min={0}
            max={0.1}
            step={0.001}
            value={params.rotationRate}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={9}
          />
          <Slider
            name="shape"
            label="Shape"
            min={3}
            max={10}
            step={1}
            value={params.shape}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={10}
          />
          <Slider
            name="shapeWave"
            label="Shape Wave"
            min={0}
            max={10}
            step={0.1}
            value={params.shapeWave}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={11}
          />
          <Slider
            name="shapeRate"
            label="Shape Rate"
            min={0}
            max={10}
            step={0.1}
            value={params.shapeRate}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={12}
          />
          <Slider
            name="fill"
            label="Fill"
            min={0}
            max={1}
            step={0.01}
            value={params.fill}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={13}
          />
          <Slider
            name="fillWave"
            label="Fill Wave"
            min={0}
            max={10}
            step={0.1}
            value={params.fillWave}
            onChange={(name, value) =>
              handleChange(name as keyof Params, value)
            }
            colorScheme={colorScheme}
            index={14}
          />
        </div>

        {/* Updated color scheme section */}
        <div className="mt-2 flex items-center">
          <button
            onClick={() => cycleColorScheme("prev")}
            className="text-sm px-2 py-1"
            aria-label="Previous color scheme"
          >
            ◀
          </button>
          <div
            className="flex-grow h-6 cursor-pointer"
            style={gradientStyle}
            onClick={() => cycleColorScheme("next")}
          />
          <button
            onClick={() => cycleColorScheme("next")}
            className="text-sm px-2 py-1"
            aria-label="Next color scheme"
          >
            ▶
          </button>
        </div>
      </div>
    </Draggable>
  );
};

export default SettingsPanel;
