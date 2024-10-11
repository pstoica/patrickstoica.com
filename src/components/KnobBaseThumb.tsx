import React from "react";

interface KnobBaseThumbProps {
  value01: number;
  theme: string;
}

export const KnobBaseThumb: React.FC<KnobBaseThumbProps> = ({
  value01,
  theme,
}) => {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 transition-height duration-100 ease-out"
      style={{
        backgroundColor: theme,
        height: `${value01 * 100}%`,
      }}
    ></div>
  );
};
