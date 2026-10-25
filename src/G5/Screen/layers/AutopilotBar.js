import React from "react";

import { AUTOPILOT_BAR, CENTER } from "../../config/layout";
import { BLACK, GREEN, WHITE } from "../../config/palette";
import { useSettings } from "../../sim/SimContext";

// The mode annunciation strip. It only appears when the autopilot is engaged,
// and the modes come from the autopilot rather than being decoration.
const AutopilotBar = () => {
  const { autopilot, apModes } = useSettings();

  if (!autopilot || !apModes) {
    return null;
  }

  const fields = ["AP", apModes.lateral, apModes.vertical];
  const slot = 150;
  const left = CENTER.x - (fields.length * slot) / 2;

  return (
    <g transform={`translate(0 ${AUTOPILOT_BAR.y})`}>
      <rect
        x={left}
        width={fields.length * slot}
        height={AUTOPILOT_BAR.height}
        fill={BLACK}
      />
      {fields.map((field, index) => (
        <g key={field}>
          <text
            className="g5-annunciation"
            x={left + slot * index + slot / 2}
            y={AUTOPILOT_BAR.height / 2 + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fill={GREEN}
          >
            {field}
          </text>
          {index > 0 && (
            <rect
              x={left + slot * index - 2}
              y={8}
              width={3}
              height={AUTOPILOT_BAR.height - 16}
              fill={WHITE}
            />
          )}
        </g>
      ))}
    </g>
  );
};

export default AutopilotBar;
