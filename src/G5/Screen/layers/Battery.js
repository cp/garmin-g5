import React from "react";

import { BATTERY } from "../../config/layout";
import { BLACK, RED, WHITE } from "../../config/palette";
import { useSettings, useValues } from "../../sim/SimContext";
import { useMotionValues } from "../../hooks/useMotionBinding";
import {
  batteryColor,
  formatBatteryTime,
  FULL_MINUTES,
} from "../../sim/battery";

// Shown when the unit is running on its internal battery: time remaining and
// an icon that walks green to yellow to red.
const Battery = () => {
  const { onExternalPower } = useSettings();
  const { batteryMinutes } = useValues();

  const textRef = useMotionValues([batteryMinutes], (node, minutes) => {
    node.textContent = formatBatteryTime(minutes);
  });

  const fillRef = useMotionValues([batteryMinutes], (node, minutes) => {
    node.setAttribute("width", Math.max(0, (minutes / FULL_MINUTES) * 44));
    node.setAttribute("fill", batteryColor(minutes));
  });

  if (onExternalPower) {
    return null;
  }

  const { x, y, width, height } = BATTERY;

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={width} height={height} fill={BLACK} />
      <text
        ref={textRef}
        className="g5-value-small"
        x={10}
        y={height / 2 + 1}
        dominantBaseline="central"
        fill={WHITE}
      />
      <g transform={`translate(${width - 62} ${height / 2 - 13})`}>
        <rect
          width={50}
          height={26}
          fill="none"
          stroke={WHITE}
          strokeWidth={3}
        />
        <rect x={50} y={7} width={6} height={12} fill={WHITE} />
        <rect ref={fillRef} x={3} y={3} height={20} fill={WHITE} />
      </g>
    </g>
  );
};

export const BatteryAnnunciation = () => {
  const { batteryFault, batteryEmpty, onExternalPower } = useSettings();

  if (onExternalPower || (!batteryFault && !batteryEmpty)) {
    return null;
  }

  const label = batteryEmpty ? "NO BATT" : "BATT";

  return (
    <g
      transform={`translate(${BATTERY.x + 8} ${BATTERY.y + BATTERY.height + 8})`}
    >
      <rect width={150} height={40} fill={BLACK} stroke={RED} strokeWidth={3} />
      <text
        className="g5-annunciation"
        x={75}
        y={21}
        textAnchor="middle"
        dominantBaseline="central"
        fill={RED}
      >
        {label}
      </text>
    </g>
  );
};

export default Battery;
