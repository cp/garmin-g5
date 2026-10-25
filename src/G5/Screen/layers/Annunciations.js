import React from "react";

import { CENTER, SCREEN } from "../../config/layout";
import { BLACK, FAIL, WHITE } from "../../config/palette";
import { useSettings } from "../../sim/SimContext";

// When a function fails the G5 draws a large red X over the instrument that
// lost its data, with a text flag naming the failure.
export const RedX = ({ x, y, width, height }) => (
  <g transform={`translate(${x} ${y})`}>
    <line x1={0} y1={0} x2={width} y2={height} stroke={FAIL} strokeWidth={10} />
    <line x1={width} y1={0} x2={0} y2={height} stroke={FAIL} strokeWidth={10} />
  </g>
);

export const Flag = ({ label, y, width = 360 }) => (
  <g transform={`translate(${CENTER.x - width / 2} ${y})`}>
    <rect
      width={width}
      height={56}
      fill={BLACK}
      stroke={FAIL}
      strokeWidth={4}
    />
    <text
      className="g5-flag"
      x={width / 2}
      y={30}
      textAnchor="middle"
      dominantBaseline="central"
      fill={FAIL}
    >
      {label}
    </text>
  </g>
);

const Annunciations = () => {
  const { failed } = useSettings();

  if (!failed) {
    return null;
  }

  return (
    <g>
      <RedX x={200} y={120} width={560} height={480} />
      <Flag label="ATTITUDE FAIL" y={CENTER.y - 28} />
      <RedX x={12} y={200} width={150} height={320} />
      <RedX x={720} y={200} width={220} height={320} />
      <Flag label="HEADING FAIL" y={6} width={300} />
    </g>
  );
};

// The alignment sequence on power-up. The real unit takes up to a minute;
// this runs the same states compressed into about five seconds.
export const Alignment = () => {
  const { phase } = useSettings();

  if (phase === "on" || phase === "off") {
    return null;
  }

  if (phase === "splash") {
    return (
      <g>
        <rect width={SCREEN.width} height={SCREEN.height} fill={BLACK} />
        <text
          className="g5-splash"
          x={CENTER.x}
          y={CENTER.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill={WHITE}
        >
          GARMIN
        </text>
      </g>
    );
  }

  const label =
    phase === "aligningWings" ? "ALIGNING\nKEEP WINGS LEVEL" : "ALIGNING";
  const lines = label.split("\n");

  return (
    <g>
      <rect
        x={CENTER.x - 260}
        y={CENTER.y - 20 - (lines.length - 1) * 30}
        width={520}
        height={60 + (lines.length - 1) * 56}
        fill={BLACK}
        opacity={0.85}
      />
      <text
        className="g5-aligning"
        x={CENTER.x}
        y={CENTER.y + 10 - (lines.length - 1) * 28}
        textAnchor="middle"
        fill={WHITE}
      >
        {lines.map((line, index) => (
          <tspan key={line} x={CENTER.x} dy={index === 0 ? 0 : 56}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
};

export default Annunciations;
