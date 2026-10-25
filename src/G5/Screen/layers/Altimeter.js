import React from "react";

import { ALTIMETER, CENTER, SCREEN, VSI } from "../../config/layout";
import { BLACK, CYAN, PANEL, WHITE, YELLOW } from "../../config/palette";
import { useSettings, useValues } from "../../sim/SimContext";
import {
  useMotionText,
  useMotionTransform,
  useMotionValues,
} from "../../hooks/useMotionBinding";
import { tapeExtent, tapeTranslate, tickOffset } from "../tape";
import Drum from "../parts/Drum";
import Readout from "../parts/Readout";
import { useTickWindow } from "../useTickWindow";

const { pixelsPerFoot: PPF } = ALTIMETER;
const extent = tapeExtent(SCREEN.height, CENTER.y, PPF);

const Altimeter = () => {
  const { altitude } = useValues();
  const { profile } = useSettings();

  const ticks = useTickWindow(altitude, {
    step: ALTIMETER.labelInterval,
    interval: ALTIMETER.minorInterval,
    unitsBefore: extent.unitsBefore,
    unitsAfter: extent.unitsAfter,
    min: profile.altitudeRange.min,
    max: profile.altitudeRange.max,
  });

  const tapeRef = useMotionTransform(
    altitude,
    (v) => `translate(0 ${CENTER.y + tapeTranslate(v, PPF)})`,
  );

  return (
    <g>
      <defs>
        <clipPath id="g5-altimeter-clip">
          <rect
            x={ALTIMETER.tickLeft - 8}
            width={SCREEN.width - ALTIMETER.tickLeft + 8}
            height={SCREEN.height}
          />
        </clipPath>
      </defs>

      {/* The wash stops at the vertical speed column, which carries its
          own, so the VSI pointer is not dimmed by both. */}
      <rect
        x={ALTIMETER.tickLeft}
        width={VSI.left - ALTIMETER.tickLeft}
        height={SCREEN.height}
        fill={PANEL}
      />

      <g clipPath="url(#g5-altimeter-clip)">
        <g ref={tapeRef}>
          {ticks.map((tick) => {
            const major = tick % ALTIMETER.labelInterval === 0;
            const length = major
              ? ALTIMETER.tickLength.major
              : ALTIMETER.tickLength.minor;

            return (
              <g key={tick} transform={`translate(0 ${tickOffset(tick, PPF)})`}>
                <rect
                  x={ALTIMETER.tickLeft}
                  y={-2}
                  width={length}
                  height={4}
                  fill={WHITE}
                />
                {major && (
                  <text
                    className="g5-tape-label"
                    x={ALTIMETER.labelLeft}
                    y={0}
                    dominantBaseline="central"
                  >
                    {tick}
                  </text>
                )}
              </g>
            );
          })}

          <SelectedAltitudeBug />
        </g>
      </g>

      <SelectedAltitude />
      <AltitudeReadout altitude={altitude} />
      <Baro />
    </g>
  );
};

const SelectedAltitudeBug = () => {
  const { selectedAltitude } = useSettings();

  return (
    <g transform={`translate(0 ${tickOffset(selectedAltitude, PPF)})`}>
      <path
        d={`M ${ALTIMETER.tickLeft - 4} -18 L ${ALTIMETER.tickLeft + 26} -18 L ${
          ALTIMETER.tickLeft + 26
        } -6 L ${ALTIMETER.tickLeft + 8} 0 L ${
          ALTIMETER.tickLeft + 26
        } 6 L ${ALTIMETER.tickLeft + 26} 18 L ${ALTIMETER.tickLeft - 4} 18 Z`}
        fill={CYAN}
      />
    </g>
  );
};

// The altitude alerter: the box flashes approaching the selected altitude and
// turns yellow if the aircraft leaves the band after capturing it.
const SelectedAltitude = () => {
  const { selectedAltitude } = useSettings();
  const { altitude } = useValues();
  const { x, y, width, height } = ALTIMETER.selected;

  const ref = useMotionValues([altitude], (node, current) => {
    const error = Math.abs(selectedAltitude - current);
    node.setAttribute("fill", error > 200 && error < 1000 ? YELLOW : CYAN);
  });

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={width}
        height={height}
        fill={BLACK}
        stroke={WHITE}
        strokeWidth={3}
      />
      <path
        d="M 10 14 L 30 14 L 30 24 L 18 28 L 30 32 L 30 42 L 10 42 Z"
        fill={CYAN}
      />
      <text
        ref={ref}
        className="g5-selected"
        x={width - 14}
        y={height / 2}
        textAnchor="end"
        dominantBaseline="central"
        fill={CYAN}
      >
        {selectedAltitude}
      </text>
    </g>
  );
};

// The drum resolves to twenty feet, so the whole readout does.
const roundToStep = (value) =>
  Math.round(value / ALTIMETER.minorInterval) * ALTIMETER.minorInterval;

const AltitudeReadout = ({ altitude }) => {
  const { width, height } = ALTIMETER.readout;

  // Everything above the last two digits is a plain number; the last two roll
  // in twenty foot steps, as they do on the real readout.
  //
  // Both halves have to round the same way, or the readout disagrees with
  // itself mid-roll and shows 3000 when the aircraft is at 3098.
  const hundredsRef = useMotionText(altitude, (v) =>
    String(Math.floor(roundToStep(v) / 100)),
  );

  return (
    <Readout
      x={ALTIMETER.readout.x}
      y={CENTER.y - height / 2}
      width={width}
      height={height}
      pointer="left"
    >
      <text
        ref={hundredsRef}
        className="g5-readout"
        x={width - 96}
        y={height / 2}
        textAnchor="end"
        dominantBaseline="central"
      />
      <Drum
        value={altitude}
        step={20}
        cellHeight={48}
        windowHeight={66}
        width={92}
        clipId="g5-alt-drum"
        className="g5-readout-small"
        x={width - 48}
        y={height / 2}
        format={(v) =>
          String((((Math.round(v / 20) * 20) % 100) + 100) % 100).padStart(
            2,
            "0",
          )
        }
      />
    </Readout>
  );
};

const Baro = () => {
  const { baro } = useSettings();
  const { x, y, width, height } = ALTIMETER.baro;

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={width}
        height={height}
        fill={BLACK}
        stroke={CYAN}
        strokeWidth={3}
      />
      <text
        className="g5-baro"
        x={width - 34}
        y={height / 2 + 2}
        textAnchor="end"
        dominantBaseline="central"
        fill={CYAN}
      >
        {baro.toFixed(2)}
      </text>
      <text
        className="g5-units-small"
        x={width - 26}
        y={height / 2 + 2}
        fill={CYAN}
      >
        <tspan x={width - 26} dy={-8}>
          i
        </tspan>
        <tspan x={width - 26} dy={18}>
          n
        </tspan>
      </text>
    </g>
  );
};

export default Altimeter;
