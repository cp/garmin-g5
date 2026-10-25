import React from "react";

import { ALTIMETER, CENTER } from "../../config/layout";
import { MAGENTA, PANEL_STRONG, WHITE } from "../../config/palette";
import { useValues } from "../../sim/SimContext";
import { useMotionTransform } from "../../hooks/useMotionBinding";

// The vertical deviation scale between the attitude and the altitude tape.
// Here it shows deviation from the selected altitude, which is what the model
// actually knows.
const FULL_SCALE = 500; // feet

const Deviation = () => {
  const { deviation } = useValues();
  const { x, width, height } = ALTIMETER.deviation;
  const top = CENTER.y - height / 2;

  const ref = useMotionTransform(deviation, (v) => {
    const clamped = Math.max(-FULL_SCALE, Math.min(FULL_SCALE, v));

    return `translate(0 ${(-clamped / FULL_SCALE) * (height / 2)})`;
  });

  return (
    <g transform={`translate(${x} ${top})`}>
      <rect width={width} height={height} fill={PANEL_STRONG} />
      {[-2, -1, 1, 2].map((dot) => (
        <circle
          key={dot}
          cx={width / 2}
          cy={height / 2 + (dot / 2) * (height / 2) * 0.8}
          r={7}
          fill="none"
          stroke={WHITE}
          strokeWidth={3}
        />
      ))}
      <g transform={`translate(${width / 2} ${height / 2})`}>
        <g ref={ref}>
          <path d="M 0 -14 L 14 0 L 0 14 L -14 0 Z" fill={MAGENTA} />
        </g>
      </g>
    </g>
  );
};

export default Deviation;
