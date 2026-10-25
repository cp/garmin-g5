import React from "react";

import { SCREEN } from "../config/layout";
import { useSettings } from "../sim/SimContext";
import Attitude from "./layers/Attitude";
import Airspeed from "./layers/Airspeed";
import Altimeter from "./layers/Altimeter";
import AutopilotBar from "./layers/AutopilotBar";
import Battery, { BatteryAnnunciation } from "./layers/Battery";
import Deviation from "./layers/Deviation";
import HeadingTape from "./layers/HeadingTape";
import Menu from "./layers/Menu";
import Vsi from "./layers/Vsi";
import Annunciations, { Alignment } from "./layers/Annunciations";
import {
  CourseDeviation,
  GroundSpeed,
  SlipSkid,
  TrueAirspeed,
  TurnRate,
} from "./layers/Bottom";
import ReferenceOverlay from "./ReferenceOverlay";

import "./Screen.css";

// One SVG scene graph, one group per layer, drawn back to front.
const Screen = () => {
  const { phase, brightness, brightnessAuto } = useSettings();
  const awake = phase !== "off";
  const aligned = phase === "on";
  const dim = brightnessAuto ? 0.08 : 1 - brightness;

  return (
    <div className="Screen">
      <svg
        className="ScreenSvg"
        viewBox={`0 0 ${SCREEN.width} ${SCREEN.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width={SCREEN.width} height={SCREEN.height} fill="#000" />

        {awake && (
          <>
            <Attitude />
            <Deviation />
            <Airspeed />
            <Vsi />
            <Altimeter />
            <HeadingTape />

            <CourseDeviation />
            <SlipSkid />
            <TurnRate />

            <GroundSpeed />
            <TrueAirspeed />
            <Battery />
            <BatteryAnnunciation />
            <AutopilotBar />

            {aligned && <Annunciations />}
            <Menu />
            <Alignment />
          </>
        )}

        {/* Backlight: the real power button dims the display, so ours does. */}
        <rect
          width={SCREEN.width}
          height={SCREEN.height}
          fill="#000"
          opacity={awake ? dim : 0}
          pointerEvents="none"
        />
      </svg>

      <ReferenceOverlay />
    </div>
  );
};

export default Screen;
