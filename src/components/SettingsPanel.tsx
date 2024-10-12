import React, { useState, useEffect, useRef, useCallback } from "react";
import Draggable from "react-draggable";
import Slider from "./Slider";
import debounce from "lodash/debounce";

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
  opacity: number;
  opacityWave: number;
  opacityRate: number;
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
};

export const localStorageKey = "sense-weave-settings";
export const defaultParams =
  typeof window !== "undefined"
    ? window.localStorage.getItem(localStorageKey)
      ? JSON.parse(window.localStorage.getItem(localStorageKey) || "")
      : DEFAULT_PARAMS
    : DEFAULT_PARAMS;

const SettingsPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [params, setParams] = useState<Params>(defaultParams);
  useEffect(() => {
    setParams(
      typeof window !== "undefined"
        ? window.localStorage.getItem(localStorageKey)
          ? JSON.parse(window.localStorage.getItem(localStorageKey) || "")
          : DEFAULT_PARAMS
        : DEFAULT_PARAMS
    );
    setIsVisible(true);
  }, []);

  console.log(params);

  const [colorScheme, setColorScheme] = useState(
    Object.values(colorSchemes)[0]
  );
  const [currentSchemeIndex, setCurrentSchemeIndex] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

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

  const updateLocalStorage = useCallback(
    debounce((params: any) => {
      window.localStorage.setItem(localStorageKey, JSON.stringify(params));
    }, 300),
    [localStorageKey]
  );

  useEffect(() => {
    if (window.updateSketchParams) {
      window.updateSketchParams(params);
    }

    updateLocalStorage(params);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      updateLocalStorage.cancel();
    };
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

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark");
    if (window.updateSketchParams) {
      window.updateSketchParams({ isDarkMode: newDarkMode });
    }
  };

  const resetParams = () => {
    setParams(defaultParams);
    if (window.updateSketchParams) {
      window.updateSketchParams(defaultParams);
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
        className={`fixed pb-1 px-1 z-50 border ${
          isDarkMode
            ? "bg-black text-gray-200 border-gray-800"
            : "bg-white text-gray-800 border-gray-200"
        }`}
        style={{
          maxHeight: "70vh",
          maxWidth: "100vw",
          overflowY: "auto",
        }}
      >
        <div
          className={`flex items-center justify-between border-b ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <button
            onClick={toggleDarkMode}
            onTouchStart={toggleDarkMode}
            className="px-2 py-1 text-sm"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <div className="handle cursor-move text-center uppercase font-mono flex-grow">
            :::::::
          </div>
          <button
            onClick={resetParams}
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
              max={40}
              step={0.01}
              value={params.smoothness}
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={0}
              isDarkMode={isDarkMode}
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
              isDarkMode={isDarkMode}
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
              isDarkMode={isDarkMode}
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
              isDarkMode={isDarkMode}
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
              isDarkMode={isDarkMode}
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
              index={5}
              isDarkMode={isDarkMode}
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
              index={6}
              isDarkMode={isDarkMode}
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
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={7}
              isDarkMode={isDarkMode}
            />
            <Slider
              name="rotationRate"
              label="Rotate Rate"
              min={0}
              max={0.1}
              step={0.001}
              value={params.rotationRate}
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={8}
              isDarkMode={isDarkMode}
            />
            <Slider
              name="shape"
              label="Shape"
              min={2}
              max={10}
              step={1}
              value={params.shape}
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={9}
              isDarkMode={isDarkMode}
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
              index={10}
              isDarkMode={isDarkMode}
            />
            <Slider
              name="shapeRate"
              label="Shape Rate"
              min={0}
              max={0.2}
              step={0.01}
              value={params.shapeRate}
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={11}
              isDarkMode={isDarkMode}
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
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={12}
              isDarkMode={isDarkMode}
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
              index={13}
              isDarkMode={isDarkMode}
            />
            <Slider
              name="fillRate"
              label="Fill Rate"
              min={0}
              max={0.1}
              step={0.001}
              value={params.fillRate}
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={14}
              isDarkMode={isDarkMode}
            />
            <Slider
              name="opacity"
              label="Opacity"
              min={0}
              max={1}
              step={0.01}
              value={params.opacity}
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={15}
              isDarkMode={isDarkMode}
            />
            <Slider
              name="opacityWave"
              label="Opacity Wave"
              min={0}
              max={1}
              step={0.01}
              value={params.opacityWave}
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={16}
              isDarkMode={isDarkMode}
            />
            <Slider
              name="opacityRate"
              label="Opacity Rate"
              min={0}
              max={0.1}
              step={0.001}
              value={params.opacityRate}
              onChange={(name, value) =>
                handleChange(name as keyof Params, value)
              }
              colorScheme={colorScheme}
              index={17}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        <div
          className={`select-none mt-1 flex items-center border-t pt-1 ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <button
            onClick={() => cycleColorScheme("prev")}
            className="text-sm px-2"
            aria-label="Previous color scheme"
            onTouchStart={() => cycleColorScheme("prev")}
          >
            ◀
          </button>
          <div
            role="button"
            className="flex-grow h-6 cursor-pointer"
            style={gradientStyle}
            onClick={() => cycleColorScheme("next")}
            onTouchStart={() => cycleColorScheme("next")}
          />
          <button
            onClick={() => cycleColorScheme("next")}
            className="text-sm px-2"
            aria-label="Next color scheme"
            onTouchStart={() => cycleColorScheme("next")}
          >
            ▶
          </button>
        </div>
      </div>
    </Draggable>
  );
};

export default SettingsPanel;
