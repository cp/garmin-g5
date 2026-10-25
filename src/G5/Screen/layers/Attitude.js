import React from "react";

import { ATTITUDE, CENTER, HEADING, SCREEN } from "../../config/layout";
import { GROUND, SKY, SYMBOL, RED, WHITE } from "../../config/palette";
import { useValues } from "../../sim/SimContext";
import { useMotionTransform } from "../../hooks/useMotionBinding";

const { pixelsPerDegree: PPD, markHalfWidth, markInterval } = ATTITUDE;

// The sky and ground have to cover the screen at any attitude, so they extend
// well past it in every direction.
const BLEED = 1600;

const ladderMarks = () => {
  const marks = [];

  for (let pitch = -90; pitch <= 90; pitch += markInterval) {
    if (pitch === 0) continue;

    const magnitude = Math.abs(pitch);
    const kind = magnitude % 10 === 0 ? 10 : magnitude % 5 === 0 ? 5 : 2.5;
    marks.push({
      pitch,
      halfWidth: markHalfWidth[kind],
      labelled: kind === 10,
    });
  }

  return marks;
};

const MARKS = ladderMarks();

// Red chevrons point back towards the horizon once the attitude is unusual.
const chevron = (direction) => {
  const w = 90;
  const h = 56;
  const s = direction;

  return `M ${-w} ${s * h} L 0 0 L ${w} ${s * h} L ${w - 26} ${s * h} L 0 ${
    s * (h - 26)
  } L ${-(w - 26)} ${s * h} Z`;
};

const Attitude = () => {
  const { pitch, roll } = useValues();

  // Pitch and roll move together, so they are bound as a pair: rotate about
  // the aircraft symbol, then slide the horizon along the rotated vertical.
  const horizonTransform = (p) => `translate(0 ${p * PPD})`;
  const rollTransform = (r) =>
    `translate(${CENTER.x} ${CENTER.y}) rotate(${-r})`;

  // The sky and ground, and the pitch scale over them, follow the same two
  // transforms but are clipped differently, so each needs its own binding.
  const horizonRef = useMotionTransform(pitch, horizonTransform);
  const rollRef = useMotionTransform(roll, rollTransform);
  const ladderHorizonRef = useMotionTransform(pitch, horizonTransform);
  const ladderRollRef = useMotionTransform(roll, rollTransform);

  return (
    <g>
      <defs>
        <linearGradient id="g5-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SKY.top} />
          <stop offset="100%" stopColor={SKY.horizon} />
        </linearGradient>
        <linearGradient id="g5-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GROUND.horizon} />
          <stop offset="100%" stopColor={GROUND.bottom} />
        </linearGradient>
        <clipPath id="g5-screen">
          <rect width={SCREEN.width} height={SCREEN.height} />
        </clipPath>
        <clipPath id="g5-attitude">
          <rect
            y={HEADING.height + 6}
            width={SCREEN.width}
            height={SCREEN.height - HEADING.height - 6}
          />
        </clipPath>
      </defs>

      <g clipPath="url(#g5-screen)">
        <g ref={rollRef}>
          <g ref={horizonRef}>
            <rect
              x={-BLEED}
              y={-BLEED}
              width={BLEED * 2}
              height={BLEED}
              fill="url(#g5-sky)"
            />
            <rect
              x={-BLEED}
              y={0}
              width={BLEED * 2}
              height={BLEED}
              fill="url(#g5-ground)"
            />
          </g>
        </g>
      </g>

      <g clipPath="url(#g5-attitude)">
        <g ref={ladderRollRef}>
          <g ref={ladderHorizonRef}>
            {/* The white horizon line is part of the pitch scale, so it is
                shorter than the sky/ground boundary behind it. */}
            <rect
              x={-ATTITUDE.horizonHalfWidth}
              y={-2}
              width={ATTITUDE.horizonHalfWidth * 2}
              height={4}
              fill={WHITE}
            />

            {MARKS.map(({ pitch: p, halfWidth, labelled }) => (
              <g key={p} transform={`translate(0 ${-p * PPD})`}>
                <rect
                  x={-halfWidth}
                  y={-1.5}
                  width={halfWidth * 2}
                  height={3}
                  fill={WHITE}
                />
                {labelled && (
                  <>
                    <text
                      className="g5-pitch-label"
                      x={-ATTITUDE.labelOffset}
                      y={10}
                      textAnchor="middle"
                    >
                      {Math.abs(p)}
                    </text>
                    <text
                      className="g5-pitch-label"
                      x={ATTITUDE.labelOffset}
                      y={10}
                      textAnchor="middle"
                    >
                      {Math.abs(p)}
                    </text>
                  </>
                )}
              </g>
            ))}

            <path
              d={chevron(1)}
              transform={`translate(0 ${-ATTITUDE.chevronAbove * PPD})`}
              fill="none"
              stroke={RED}
              strokeWidth={10}
            />
            <path
              d={chevron(-1)}
              transform={`translate(0 ${-ATTITUDE.chevronBelow * PPD})`}
              fill="none"
              stroke={RED}
              strokeWidth={10}
            />
          </g>
        </g>
      </g>

      <RollScale />
      <AircraftSymbol />
    </g>
  );
};

const RollScale = () => {
  const { roll } = useValues();
  const pointerRef = useMotionTransform(
    roll,
    (r) => `translate(${CENTER.x} ${CENTER.y}) rotate(${-r})`,
  );

  const tick = (degrees, length) => {
    const radians = ((degrees - 90) * Math.PI) / 180;
    const outer = ATTITUDE.rollRadius;
    const inner = outer - length;

    return {
      x1: CENTER.x + Math.cos(radians) * inner,
      y1: CENTER.y + Math.sin(radians) * inner,
      x2: CENTER.x + Math.cos(radians) * outer,
      y2: CENTER.y + Math.sin(radians) * outer,
    };
  };

  const arc = (from, to) => {
    const point = (degrees) => {
      const radians = ((degrees - 90) * Math.PI) / 180;

      return [
        CENTER.x + Math.cos(radians) * ATTITUDE.rollRadius,
        CENTER.y + Math.sin(radians) * ATTITUDE.rollRadius,
      ];
    };

    return `M ${point(from).join(" ")} A ${ATTITUDE.rollRadius} ${
      ATTITUDE.rollRadius
    } 0 0 1 ${point(to).join(" ")}`;
  };

  const ticks = [
    ...ATTITUDE.rollMajorTicks.flatMap((t) => [t, -t]).map((t) => [t, "major"]),
    ...ATTITUDE.rollMinorTicks.flatMap((t) => [t, -t]).map((t) => [t, "minor"]),
  ];

  const size = ATTITUDE.rollPointerSize;

  return (
    <g>
      <path d={arc(-60, 60)} fill="none" stroke={WHITE} strokeWidth={4} />

      {ticks.map(([degrees, kind]) => (
        <line
          key={`${degrees}-${kind}`}
          {...tick(degrees, ATTITUDE.rollTickLength[kind])}
          stroke={WHITE}
          strokeWidth={kind === "major" ? 5 : 3}
        />
      ))}

      {/* The inverted triangle marks zero on the scale. */}
      <path
        d={`M ${-size} 0 L ${size} 0 L 0 ${size * 1.2} Z`}
        transform={`translate(${CENTER.x} ${
          CENTER.y - ATTITUDE.rollRadius - 2
        })`}
        fill={WHITE}
      />

      {/* The pointer rides the scale and shows angle of bank. */}
      <g ref={pointerRef}>
        <path
          d={`M ${-size} 0 L ${size} 0 L 0 ${-size * 1.2} Z`}
          transform={`translate(0 ${-ATTITUDE.rollRadius + 4})`}
          fill={WHITE}
        />
      </g>
    </g>
  );
};

const AircraftSymbol = () => (
  <g transform={`translate(${CENTER.x} ${CENTER.y})`}>
    {[-1, 1].map((side) => (
      <rect
        key={side}
        x={side === -1 ? -240 : 130}
        y={-7}
        width={110}
        height={15}
        fill={SYMBOL}
        stroke="#000"
        strokeWidth={3}
      />
    ))}

    <path
      d="M -158 72 L -12 4 L 12 4 L 158 72 L 124 72 L 0 22 L -124 72 Z"
      fill={SYMBOL}
      stroke="#000"
      strokeWidth={3}
      strokeLinejoin="round"
    />
  </g>
);

export default Attitude;
