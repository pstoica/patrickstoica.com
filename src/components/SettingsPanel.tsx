import React, { useState, useEffect, useRef, useCallback } from "react";
import Draggable from "react-draggable";
import Slider from "./Slider";
import debounce from "lodash/debounce";
import { useLocalStorage } from "usehooks-ts";

declare global {
  interface Window {
    updateSketchParams: (newParams: any) => void;
    isInteractingWithUI: boolean;
  }
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
    "#F7DC6F",
    "#FFD700",
    "#FFA500",
    "#FF8C00",
    "#FF7F50",
    "#FFE4E1", // Near-white warm color (Misty Rose)
  ],
  cool: [
    "#6495ED",
    "#87CEEB",
    "#00CED1",
    "#40E0D0",
    "#48D1CC",
    "#F0FFFF", // Near-white cool color (Azure)
  ],
  twilight: [
    "#4B0082", // Indigo (deep purple)
    "#8A2BE2", // Blue Violet
    "#9932CC", // Dark Orchid
    "#FF4500", // Orange Red
    "#FFA500", // Orange
    "#FFD700", // Gold
    "#FFFFFF", // White
    "#F8F8FF", // Ghost White
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
  opacity: number;
  opacityWave: number;
  opacityRate: number;
  colorScheme: keyof typeof colorSchemes;
  isDarkMode: boolean;
}

export const DEFAULT_PARAMS = {
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
  opacity: 1,
  opacityWave: 0,
  opacityRate: 0,
  colorScheme: Object.keys(colorSchemes)[0] as keyof typeof colorSchemes,
  isDarkMode:
    typeof window !== "undefined"
      ? window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      : false,
};

const SettingsPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [params, setParams] = useLocalStorage<Params>(
    "sense-weave-settings",
    DEFAULT_PARAMS,
    {
      deserializer(value) {
        return { ...DEFAULT_PARAMS, ...JSON.parse(value) };
      },
    }
  );

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const toggleSettings = () => {
      setIsVisible(!isVisible);
    };
    window.addEventListener("toggleSettings", toggleSettings);
    return () => window.removeEventListener("toggleSettings", toggleSettings);
  }, [isVisible]);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const calculatePosition = useCallback(() => {
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

  const debouncedCalculatePosition = useCallback(
    debounce(calculatePosition, 0),
    [calculatePosition]
  );

  useEffect(() => {
    calculatePosition();
    window.addEventListener("resize", debouncedCalculatePosition);

    return () => {
      window.removeEventListener("resize", debouncedCalculatePosition);
      debouncedCalculatePosition.cancel();
    };
  }, [isVisible, debouncedCalculatePosition]);

  useEffect(() => {
    window.isInteractingWithUI = false;
  }, []);

  useEffect(() => {
    if (window.updateSketchParams) {
      window.updateSketchParams(params);
    }
  }, [params]);

  const handleInteractionStart = () => {
    window.isInteractingWithUI = true;
  };

  const handleInteractionEnd = () => {
    window.isInteractingWithUI = false;
  };

  const handleChange = (name: keyof Params, value: number | string) => {
    handleInteractionStart();
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
  };

  const cycleColorScheme = (direction: "next" | "prev") => {
    handleInteractionStart();
    const schemes = Object.keys(colorSchemes) as Array<
      keyof typeof colorSchemes
    >;
    const currentIndex = schemes.indexOf(params.colorScheme);
    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % schemes.length;
    } else {
      newIndex = (currentIndex - 1 + schemes.length) % schemes.length;
    }
    const newScheme = schemes[newIndex];
    setParams((prev) => ({ ...prev, colorScheme: newScheme }));
  };

  const toggleDarkMode = () => {
    handleInteractionStart();
    setParams((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
    if (window.updateSketchParams) {
      window.updateSketchParams({ isDarkMode: !params.isDarkMode });
    }
  };

  const resetParams = (e: React.MouseEvent | React.TouchEvent) => {
    handleInteractionStart();
    e.preventDefault();
    e.stopPropagation();
    setParams(DEFAULT_PARAMS);
  };

  const gradientStyle = {
    background: `linear-gradient(to right, ${colorSchemes[
      params.colorScheme
    ].join(", ")})`,
  };

  const preventTouchPropagation = (e: React.TouchEvent) => {
    e.stopPropagation();
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
        className={`fixed pb-1 px-1 z-50 border dark:bg-black dark:text-gray-200 dark:border-gray-800 bg-white text-gray-800 border-gray-200`}
        style={{
          maxHeight: "70vh",
          maxWidth: "100vw",
          overflowY: "auto",
        }}
        onTouchStart={preventTouchPropagation}
        onTouchMove={preventTouchPropagation}
        onTouchEnd={preventTouchPropagation}
      >
        <div
          className={`flex items-center justify-between border-b dark:border-gray-800 border-gray-200`}
        >
          <button
            onMouseDown={toggleDarkMode}
            onTouchStart={toggleDarkMode}
            className="px-2 py-1 text-sm"
            aria-label="Toggle dark mode"
          >
            {params.isDarkMode ? "☀️" : "🌙"}
          </button>
          <div className="handle cursor-move text-center uppercase font-mono flex-grow">
            :::::::
          </div>
          <button
            onMouseDown={resetParams}
            onTouchStart={resetParams}
            className="px-2 py-1 text-sm"
            aria-label="Reset parameters"
          >
            ↺
          </button>
        </div>

        <div className="grid gap-1 pt-1">
          {/* First row of sliders */}
          <div className="border-gray-500 grid grid-rows-1 grid-cols-7 gap-1">
            <Slider
              name="smoothness"
              label="Brush Density"
              min={0.01}
              max={100}
              step={0.01}
              value={params.smoothness}
              onChange={(value) => handleChange("smoothness", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={0}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="gradientLength"
              label="Color Wave"
              min={100}
              max={1000}
              step={10}
              value={params.gradientLength}
              onChange={(value) => handleChange("gradientLength", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={1}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="baseShiftSpeed"
              label="Color Rate"
              min={0}
              max={40}
              step={0.01}
              value={params.baseShiftSpeed}
              onChange={(value) => handleChange("baseShiftSpeed", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={2}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="minBrushWidth"
              label="Min Size"
              min={0}
              max={50}
              step={1}
              value={params.minBrushWidth}
              onChange={(value) => handleChange("minBrushWidth", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={3}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="maxBrushWidth"
              label="Max Size"
              min={10}
              max={200}
              step={0.1}
              value={params.maxBrushWidth}
              onChange={(value) => handleChange("maxBrushWidth", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={4}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="sizeFrequency"
              label="Size Wave"
              min={0}
              max={20}
              step={0.01}
              value={params.sizeFrequency}
              onChange={(value) => handleChange("sizeFrequency", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={5}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="globalSizeFrequency"
              label="Size Rate"
              min={0}
              max={0.5}
              step={0.01}
              value={params.globalSizeFrequency}
              onChange={(value) => handleChange("globalSizeFrequency", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={6}
              isDarkMode={params.isDarkMode}
            />
          </div>

          {/* Second row of sliders */}
          <div className="border-gray-500 grid grid-rows-1 grid-cols-7 gap-1">
            {/* <Slider
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
          /> */}
            <Slider
              name="rotationWave"
              label="Rotate Wave"
              min={0}
              max={10}
              step={0.1}
              value={params.rotationWave}
              onChange={(value) => handleChange("rotationWave", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={7}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="rotationRate"
              label="Rotate Rate"
              min={0}
              max={0.1}
              step={0.001}
              value={params.rotationRate}
              onChange={(value) => handleChange("rotationRate", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={8}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="shape"
              label="Shape"
              min={2}
              max={10}
              step={1}
              value={params.shape}
              onChange={(value) => handleChange("shape", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={9}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="shapeWave"
              label="Shape Wave"
              min={0}
              max={10}
              step={0.1}
              value={params.shapeWave}
              onChange={(value) => handleChange("shapeWave", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={10}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="shapeRate"
              label="Shape Rate"
              min={0}
              max={0.2}
              step={0.01}
              value={params.shapeRate}
              onChange={(value) => handleChange("shapeRate", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={11}
              isDarkMode={params.isDarkMode}
            />
          </div>

          <div className="border-gray-500 grid grid-rows-1 grid-cols-7 gap-1 ">
            <Slider
              name="fill"
              label="Fill"
              min={0}
              max={1}
              step={0.01}
              value={params.fill}
              onChange={(value) => handleChange("fill", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={12}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="fillWave"
              label="Fill Wave"
              min={0}
              max={10}
              step={0.1}
              value={params.fillWave}
              onChange={(value) => handleChange("fillWave", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={13}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="fillRate"
              label="Fill Rate"
              min={0}
              max={0.1}
              step={0.001}
              value={params.fillRate}
              onChange={(value) => handleChange("fillRate", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={14}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="opacity"
              label="Opacity"
              min={0}
              max={1}
              step={0.01}
              value={params.opacity}
              onChange={(value) => handleChange("opacity", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={15}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="opacityWave"
              label="Opacity Wave"
              min={0}
              max={1}
              step={0.01}
              value={params.opacityWave}
              onChange={(value) => handleChange("opacityWave", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={16}
              isDarkMode={params.isDarkMode}
            />
            <Slider
              name="opacityRate"
              label="Opacity Rate"
              min={0}
              max={0.1}
              step={0.001}
              value={params.opacityRate}
              onChange={(value) => handleChange("opacityRate", value)}
              colorScheme={colorSchemes[params.colorScheme]}
              index={17}
              isDarkMode={params.isDarkMode}
            />
          </div>
        </div>

        <div
          className={`select-none mt-1 flex items-center border-t pt-1 dark:border-gray-800 border-gray-200`}
        >
          <button
            onMouseDown={() => cycleColorScheme("prev")}
            onTouchStart={(e) => {
              preventTouchPropagation(e);
              cycleColorScheme("prev");
            }}
            className="text-sm px-2"
            aria-label="Previous color scheme"
          >
            ◀
          </button>
          <div
            role="button"
            className="flex-grow h-6 cursor-pointer"
            style={gradientStyle}
            onMouseDown={() => cycleColorScheme("next")}
            onTouchStart={(e) => {
              preventTouchPropagation(e);
              cycleColorScheme("next");
            }}
          />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              cycleColorScheme("next");
            }}
            onTouchStart={(e) => {
              preventTouchPropagation(e);
              cycleColorScheme("next");
            }}
            className="text-sm px-2"
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
