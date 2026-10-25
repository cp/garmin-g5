import React from "react";

import { useMotionTransform } from "../../hooks/useMotionBinding";
import { tapeTranslate, tickOffset } from "../tape";
import { useTickWindow } from "../useTickWindow";

// A rolling number drum: the same machinery as a tape, clipped to one cell.
// This is what makes the last digit of a readout roll rather than flick.
const Drum = ({
  value,
  step,
  cellHeight,
  width,
  // The window is taller than one cell so the digits either side show
  // through, which is what makes it read as a drum rather than a counter.
  windowHeight = cellHeight,
  format = (v) => String(v),
  clipId,
  className = "g5-drum",
  x = 0,
  y = 0,
}) => {
  const ticks = useTickWindow(value, {
    step,
    interval: step,
    unitsBefore: step * 2,
    unitsAfter: step * 2,
    margin: 1,
  });

  const ref = useMotionTransform(
    value,
    (v) => `translate(0 ${tapeTranslate(v / step, cellHeight)})`,
  );

  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={clipId}>
          <rect
            x={-width / 2}
            y={-windowHeight / 2}
            width={width}
            height={windowHeight}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g ref={ref}>
          {ticks.map((tick) => (
            <text
              key={tick}
              className={className}
              x={0}
              y={tickOffset(tick / step, cellHeight)}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {format(tick)}
            </text>
          ))}
        </g>
      </g>
    </g>
  );
};

export default Drum;
