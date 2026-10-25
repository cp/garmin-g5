import React from "react";

import { CENTER, SCREEN, VSI } from "../../config/layout";
import { PANEL, WHITE } from "../../config/palette";
import { useValues } from "../../sim/SimContext";
import { useMotionTransform } from "../../hooks/useMotionBinding";

// The vertical speed tape does not move; only the pointer does.
const Vsi = () => {
  const { vsi } = useValues();

  const ticks = [];
  for (let fpm = -VSI.range; fpm <= VSI.range; fpm += VSI.minorInterval) {
    ticks.push(fpm);
  }

  const pointerRef = useMotionTransform(vsi, (v) => {
    const clamped = Math.max(-VSI.range * 1.15, Math.min(VSI.range * 1.15, v));

    return `translate(0 ${CENTER.y - clamped * VSI.pixelsPerFpm})`;
  });

  return (
    <g>
      <rect
        x={VSI.left}
        width={SCREEN.width - VSI.left}
        height={SCREEN.height}
        fill={PANEL}
      />

      {ticks.map((fpm) => {
        const major = fpm % VSI.labelInterval === 0;
        const length = major ? 20 : 11;
        const y = CENTER.y - fpm * VSI.pixelsPerFpm;

        return (
          <g key={fpm}>
            <rect
              x={VSI.left}
              y={y - 2}
              width={length}
              height={4}
              fill={WHITE}
            />
            {major && fpm !== 0 && (
              <text
                className="g5-vsi-label"
                x={956}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
              >
                {Math.abs(fpm) / 100}
              </text>
            )}
          </g>
        );
      })}

      <g ref={pointerRef}>
        <path
          d={`M ${VSI.left - 14} 0 L ${VSI.left + 2} -12 L ${
            VSI.left + VSI.pointerWidth
          } -12 L ${VSI.left + VSI.pointerWidth} 12 L ${VSI.left + 2} 12 Z`}
          fill={WHITE}
        />
      </g>
    </g>
  );
};

export default Vsi;
