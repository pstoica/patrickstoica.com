import React, { useEffect, useRef } from "react";
import p5 from "p5";

const P5Component: React.FC = () => {
  const sketchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sketchRef.current) {
      new p5((p: p5) => {
        p.setup = () => {
          p.createCanvas(400, 400);
        };

        p.draw = () => {
          p.background(220);
          p.ellipse(p.width / 2, p.height / 2, 80, 80);
        };
      }, sketchRef.current);
    }
  }, []);

  return <div ref={sketchRef}></div>;
};

export default P5Component;
