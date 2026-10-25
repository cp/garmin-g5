import React from "react";

import { CENTER, HEADING, SCREEN } from "../../config/layout";
import {
  BLACK,
  CYAN,
  MAGENTA,
  PANEL_STRONG,
  WHITE,
} from "../../config/palette";
import { useSettings, useValues } from "../../sim/SimContext";
import {
  useMotionText,
  useMotionTransform,
} from "../../hooks/useMotionBinding";
import { headingLabel } from "../tape";
import { useTickWindow } from "../useTickWindow";

const { pixelsPerDegree: PPD } = HEADING;

// The tape spans the centre column only; the airspeed and altitude columns
// own the corners.
const LEFT = 208;
const RIGHT = 700;

const HeadingTape = () => {
  const { heading } = useValues();
  const { selectedTrack } = useSettings();

  const ticks = useTickWindow(heading, {
    step: HEADING.labelInterval,
    interval: HEADING.minorInterval,
    unitsBefore: SCREEN.width / 2 / PPD,
    unitsAfter: SCREEN.width / 2 / PPD,
  });

  const tapeRef = useMotionTransform(
    heading,
    (v) => `translate(${CENTER.x - v * PPD} 0)`,
  );

  const readoutRef = useMotionText(heading, headingLabel);

  return (
    <g>
      <rect
        x={LEFT}
        width={RIGHT - LEFT}
        height={HEADING.height}
        fill={PANEL_STRONG}
      />

      <defs>
        <clipPath id="g5-heading-clip">
          <rect x={LEFT} width={RIGHT - LEFT} height={HEADING.height} />
        </clipPath>
      </defs>

      <g clipPath="url(#g5-heading-clip)">
        <g ref={tapeRef}>
          {ticks.map((tick) => {
            const major = tick % HEADING.labelInterval === 0;
            const length = major
              ? HEADING.tickLength.major
              : HEADING.tickLength.minor;

            return (
              <g key={tick} transform={`translate(${tick * PPD} 0)`}>
                <rect
                  x={-2}
                  y={HEADING.height - length}
                  width={4}
                  height={length}
                  fill={WHITE}
                />
                {major && (
                  <text
                    className="g5-heading-label"
                    x={0}
                    y={22}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {headingLabel(tick)}
                  </text>
                )}
              </g>
            );
          })}

          {/* The selected track bug rides the tape. */}
          <g transform={`translate(${selectedTrack * PPD} 0)`}>
            <path
              d={`M -16 ${HEADING.height} L 0 ${HEADING.height - 18} L 16 ${
                HEADING.height
              } Z`}
              fill={MAGENTA}
            />
          </g>
        </g>
      </g>

      {/* The dashed line under the tape is part of the display, not a divider. */}
      <line
        x1={LEFT}
        y1={HEADING.height + 2}
        x2={RIGHT}
        y2={HEADING.height + 2}
        stroke={WHITE}
        strokeWidth={3}
        strokeDasharray="6 10"
      />

      <g transform={`translate(${CENTER.x - HEADING.readout.width / 2} 0)`}>
        <rect
          width={HEADING.readout.width}
          height={HEADING.readout.height}
          fill={BLACK}
          stroke={WHITE}
          strokeWidth={3}
        />
        <text
          ref={readoutRef}
          className="g5-heading-readout"
          x={HEADING.readout.width / 2}
          y={HEADING.readout.height / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
        />
      </g>

      <TrackPointer />
    </g>
  );
};

// The hollow triangle marking the current ground track on the tape.
const TrackPointer = () => (
  <path
    d={`M ${CENTER.x - 14} ${HEADING.height + 20} L ${CENTER.x} ${
      HEADING.height + 2
    } L ${CENTER.x + 14} ${HEADING.height + 20} Z`}
    fill={CYAN}
  />
);

export default HeadingTape;
