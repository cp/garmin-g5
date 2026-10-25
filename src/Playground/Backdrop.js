import React from "react";

import { ATTITUDE, CENTER, SCREEN } from "../G5/config/layout";
import { GROUND, SKY } from "../G5/config/palette";
import { useValues } from "../G5/sim/SimContext";
import { useMotionTransform } from "../G5/hooks/useMotionBinding";

// The world outside the instrument: the same sky and ground, on the same
// attitude, blurred far enough that it reads as ambient light rather than as
// a second horizon competing with the real one.
//
// Rotation and translation commute with an isotropic blur, so this stays
// visually consistent with the attitude indicator however it moves.
const BLEED = 2400;

const Backdrop = () => {
  const { pitch, roll } = useValues();

  const horizonRef = useMotionTransform(
    pitch,
    (p) => `translate(0 ${p * ATTITUDE.pixelsPerDegree})`,
  );
  const rollRef = useMotionTransform(
    roll,
    (r) => `translate(${CENTER.x} ${CENTER.y}) rotate(${-r})`,
  );

  return (
    <div className="Backdrop" aria-hidden="true">
      <svg
        viewBox={`0 0 ${SCREEN.width} ${SCREEN.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="backdrop-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SKY.top} />
            <stop offset="100%" stopColor={SKY.horizon} />
          </linearGradient>
          <linearGradient id="backdrop-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GROUND.horizon} />
            <stop offset="100%" stopColor={GROUND.bottom} />
          </linearGradient>
        </defs>

        <g ref={rollRef}>
          <g ref={horizonRef}>
            <rect
              x={-BLEED}
              y={-BLEED}
              width={BLEED * 2}
              height={BLEED}
              fill="url(#backdrop-sky)"
            />
            <rect
              x={-BLEED}
              y={0}
              width={BLEED * 2}
              height={BLEED}
              fill="url(#backdrop-ground)"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Backdrop;
