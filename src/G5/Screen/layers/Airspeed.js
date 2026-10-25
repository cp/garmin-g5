import React from "react";

import { AIRSPEED, CENTER, SCREEN } from "../../config/layout";
import { MAGENTA, PANEL, WHITE, BLACK } from "../../config/palette";
import { useSettings, useValues } from "../../sim/SimContext";
import {
  useMotionText,
  useMotionTransform,
  useMotionValues,
} from "../../hooks/useMotionBinding";
import { bandSegments, tapeExtent, tapeTranslate, tickOffset } from "../tape";
import Drum from "../parts/Drum";
import Readout from "../parts/Readout";
import { useTickWindow } from "../useTickWindow";

const { pixelsPerKnot: PPK } = AIRSPEED;
const extent = tapeExtent(SCREEN.height, CENTER.y, PPK);

const Airspeed = () => {
  const { ias, trend } = useValues();
  const { profile } = useSettings();

  const ticks = useTickWindow(ias, {
    step: AIRSPEED.labelInterval,
    interval: AIRSPEED.minorInterval,
    unitsBefore: extent.unitsBefore,
    unitsAfter: extent.unitsAfter,
    min: profile.airspeedRange.min,
    max: profile.airspeedRange.max,
  });

  const tapeRef = useMotionTransform(
    ias,
    (v) => `translate(0 ${CENTER.y + tapeTranslate(v, PPK)})`,
  );

  const bands = bandSegments(
    profile.speedBands,
    PPK,
    AIRSPEED.bandLeft,
    AIRSPEED.bandWidth,
  );

  return (
    <g>
      <defs>
        <clipPath id="g5-airspeed-clip">
          <rect
            width={AIRSPEED.bandLeft + AIRSPEED.bandWidth + 40}
            height={SCREEN.height}
          />
        </clipPath>
        <pattern
          id="g5-barber"
          width={16}
          height={16}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width={16} height={16} fill={WHITE} />
          <rect width={8} height={16} fill="#e00000" />
        </pattern>
      </defs>

      <rect width={AIRSPEED.tickRight} height={SCREEN.height} fill={PANEL} />

      <g clipPath="url(#g5-airspeed-clip)">
        <g ref={tapeRef}>
          {bands.map((band, index) => (
            <rect
              key={`${band.from}-${index}`}
              x={band.x}
              y={band.y}
              width={band.width}
              height={band.height}
              fill={band.barberPole ? "url(#g5-barber)" : band.color}
            />
          ))}

          {ticks.map((tick) => {
            const major = tick % AIRSPEED.labelInterval === 0;
            const length = major
              ? AIRSPEED.tickLength.major
              : AIRSPEED.tickLength.minor;

            return (
              <g key={tick} transform={`translate(0 ${tickOffset(tick, PPK)})`}>
                <rect
                  x={AIRSPEED.tickRight - length}
                  y={-2}
                  width={length}
                  height={4}
                  fill={WHITE}
                />
                {major && (
                  <text
                    className="g5-tape-label"
                    x={AIRSPEED.labelRight}
                    y={0}
                    textAnchor="end"
                    dominantBaseline="central"
                  >
                    {tick}
                  </text>
                )}
              </g>
            );
          })}

          <VSpeedBugs profile={profile} />
        </g>
      </g>

      <TrendVector ias={ias} trend={trend} />
      <AirspeedReadout ias={ias} />
      <Units profile={profile} />
    </g>
  );
};

const VSpeedBugs = ({ profile }) =>
  profile.vSpeedBugs.map(({ key, label, color }) => {
    const speed = profile.vSpeeds[key];

    return (
      <g key={key} transform={`translate(0 ${tickOffset(speed, PPK)})`}>
        <rect x={AIRSPEED.bugX} y={-16} width={32} height={32} fill={BLACK} />
        <text
          className="g5-bug-label"
          x={AIRSPEED.bugX + 16}
          y={1}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
        >
          {label}
        </text>
      </g>
    );
  });

// A magenta line showing where the speed will be in six seconds. It is bound
// to both values at once, because the vector runs between them and has no
// length when the speed is steady.
const TrendVector = ({ ias, trend }) => {
  const ref = useMotionValues([ias, trend], (node, current, predicted) => {
    const height = Math.abs(predicted - current) * PPK;
    const y = predicted > current ? CENTER.y - height : CENTER.y;

    node.setAttribute("y", y);
    node.setAttribute("height", Math.max(0, height));
    node.setAttribute("opacity", height > 2 ? 1 : 0);
  });

  return (
    <rect
      ref={ref}
      x={AIRSPEED.trendLeft}
      width={AIRSPEED.trendWidth}
      fill={MAGENTA}
    />
  );
};

const AirspeedReadout = ({ ias }) => {
  // Rounded, not truncated, so the leading digits agree with the rolling
  // ones digit instead of reading 120 at 129.6 knots.
  const wholeRef = useMotionText(ias, (v) => {
    const tens = Math.floor(Math.round(Math.max(0, v)) / 10);

    return tens === 0 ? "" : String(tens);
  });

  return (
    <Readout
      x={AIRSPEED.readout.x}
      y={CENTER.y - AIRSPEED.readout.height / 2}
      width={AIRSPEED.readout.width}
      height={AIRSPEED.readout.height}
      pointer="right"
    >
      <text
        ref={wholeRef}
        className="g5-readout"
        x={AIRSPEED.readout.width - 54}
        y={AIRSPEED.readout.height / 2}
        textAnchor="end"
        dominantBaseline="central"
      />
      <Drum
        value={ias}
        step={1}
        cellHeight={62}
        windowHeight={AIRSPEED.readout.height - 10}
        width={48}
        clipId="g5-ias-drum"
        className="g5-readout"
        x={AIRSPEED.readout.width - 30}
        y={AIRSPEED.readout.height / 2}
        format={(v) => String(((v % 10) + 10) % 10)}
      />
    </Readout>
  );
};

const Units = ({ profile }) => (
  <text className="g5-units" x={AIRSPEED.unitsX} y={SCREEN.height - 92}>
    <tspan x={AIRSPEED.unitsX} dy={0}>
      {profile.units.speed[0]}
    </tspan>
    <tspan x={AIRSPEED.unitsX} dy={24}>
      {profile.units.speed[1]}
    </tspan>
  </text>
);

export default Airspeed;
