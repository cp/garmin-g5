import React from "react";

import {
  BATTERY,
  CDI,
  CENTER,
  GROUND_SPEED,
  SLIP,
  TURN_RATE,
} from "../../config/layout";
import { BLACK, MAGENTA, WHITE } from "../../config/palette";
import { useSettings, useValues } from "../../sim/SimContext";
import {
  useMotionText,
  useMotionTransform,
  useMotionValues,
} from "../../hooks/useMotionBinding";

// Course deviation, driven by the cross-track error the model accumulates when
// the aircraft drifts off the selected course.
export const CourseDeviation = () => {
  const { crossTrack } = useValues();
  const fullScale = 2; // nm either side

  const pointerRef = useMotionTransform(crossTrack, (v) => {
    const clamped = Math.max(-fullScale, Math.min(fullScale, v));

    return `translate(${(clamped / fullScale) * (CDI.width / 2)} 0)`;
  });

  const dots = [-2, -1, 1, 2];

  return (
    <g transform={`translate(${CDI.x} ${CDI.y})`}>
      <rect
        width={CDI.width}
        height={CDI.height}
        fill={BLACK}
        stroke={WHITE}
        strokeWidth={3}
      />
      {dots.map((dot) => (
        <circle
          key={dot}
          cx={CDI.width / 2 + (dot / 2) * (CDI.width / 2) * 0.76}
          cy={CDI.height / 2}
          r={6}
          fill="none"
          stroke={WHITE}
          strokeWidth={3}
        />
      ))}
      <g transform={`translate(${CDI.width / 2} 0)`}>
        <g ref={pointerRef}>
          <path
            d={`M -14 ${CDI.height - 4} L 0 ${CDI.height - 24} L 14 ${
              CDI.height - 4
            } Z`}
            fill={MAGENTA}
          />
        </g>
      </g>
    </g>
  );
};

// The ball. Slip and skid show as it swings out of the cage.
export const SlipSkid = () => {
  const { slip } = useValues();

  const ref = useMotionTransform(slip, (v) => {
    const clamped = Math.max(-1, Math.min(1, v));

    return `translate(${clamped * SLIP.travel} 0)`;
  });

  return (
    <g transform={`translate(${CENTER.x} ${SLIP.y})`}>
      <rect
        x={-SLIP.width / 2 - 6}
        y={0}
        width={5}
        height={SLIP.height}
        fill={WHITE}
      />
      <rect
        x={SLIP.width / 2 + 1}
        y={0}
        width={5}
        height={SLIP.height}
        fill={WHITE}
      />
      <g ref={ref}>
        <circle
          cx={0}
          cy={SLIP.height / 2}
          r={SLIP.height / 2 - 2}
          fill={WHITE}
        />
      </g>
    </g>
  );
};

// A magenta bar growing from the centre. A standard rate turn takes it
// exactly to the standard rate tick.
export const TurnRate = () => {
  const { turnRate } = useValues();
  const perDegreePerSecond =
    TURN_RATE.halfWidth / (TURN_RATE.standardRateDegPerSec * 1.5);

  const barRef = useMotionValues([turnRate], (node, rate) => {
    const clamped = Math.max(-4.5, Math.min(4.5, rate));
    const length = Math.abs(clamped) * perDegreePerSecond;

    node.setAttribute("x", clamped < 0 ? -length : 0);
    node.setAttribute("width", length);
  });

  return (
    <g transform={`translate(${CENTER.x} ${TURN_RATE.y})`}>
      {[-1, 1].map((side) => (
        <rect
          key={side}
          x={side * TURN_RATE.standardRateDegPerSec * perDegreePerSecond - 3}
          y={-14}
          width={6}
          height={28}
          fill={WHITE}
        />
      ))}
      <rect ref={barRef} y={-9} height={18} fill={MAGENTA} />
    </g>
  );
};

export const GroundSpeed = () => {
  const { groundSpeed } = useValues();
  const { profile } = useSettings();
  const ref = useMotionText(groundSpeed, (v) => String(Math.round(v)));

  return (
    <g transform={`translate(${GROUND_SPEED.x} ${GROUND_SPEED.y})`}>
      <rect
        width={GROUND_SPEED.width}
        height={GROUND_SPEED.height}
        fill={BLACK}
      />
      <text
        className="g5-label-small"
        x={12}
        y={GROUND_SPEED.height / 2 + 2}
        dominantBaseline="central"
      >
        GS
      </text>
      <text
        ref={ref}
        className="g5-value"
        x={GROUND_SPEED.width - 34}
        y={GROUND_SPEED.height / 2 + 2}
        textAnchor="end"
        dominantBaseline="central"
        fill={MAGENTA}
      />
      <text
        className="g5-units-small"
        x={GROUND_SPEED.width - 28}
        y={GROUND_SPEED.height / 2}
      >
        <tspan x={GROUND_SPEED.width - 28} dy={-6}>
          {profile.units.speed[0].toLowerCase()}
        </tspan>
        <tspan x={GROUND_SPEED.width - 28} dy={16}>
          {profile.units.speed[1].toLowerCase()}
        </tspan>
      </text>
    </g>
  );
};

export const TrueAirspeed = () => {
  const { trueAirspeed } = useValues();
  const { onExternalPower } = useSettings();
  const ref = useMotionText(trueAirspeed, (v) => String(Math.round(v)));

  // The battery indicator owns the top-left corner when the unit is running
  // on internal power, so TAS steps down out of its way.
  const y = onExternalPower ? 8 : BATTERY.y + BATTERY.height + 6;

  return (
    <g transform={`translate(0 ${y})`}>
      <rect width={168} height={48} fill={BLACK} />
      <text className="g5-label-small" x={12} y={26} dominantBaseline="central">
        TAS
      </text>
      <text
        ref={ref}
        className="g5-value"
        x={156}
        y={26}
        textAnchor="end"
        dominantBaseline="central"
        fill={WHITE}
      />
    </g>
  );
};
