import React from "react";

import { CENTER, MENU, SCREEN } from "../../config/layout";
import { BLACK, CYAN, WHITE } from "../../config/palette";
import { useSettings } from "../../sim/SimContext";

export const MENU_KEYS = ["back", "track", "altitude"];

const LABELS = { back: "Back", track: "Track", altitude: "Altitude" };

// The G5 menu is a three-key soft bar across the bottom of the screen, not a
// list. Turning the knob moves the cursor; pressing selects.
const Menu = () => {
  const { menu, menuIndex, selectedTrack, selectedAltitude } = useSettings();

  if (!menu) {
    return null;
  }

  if (menu === "backlight") {
    return <BacklightPage />;
  }

  if (menu === "track" || menu === "altitude") {
    return (
      <SelectModal
        title={menu === "track" ? "Select Ground Track" : "Select Altitude"}
        value={
          menu === "track"
            ? `${String(Math.round(selectedTrack)).padStart(3, "0")}°`
            : `${selectedAltitude} FT`
        }
      />
    );
  }

  const width = (SCREEN.width - MENU.gap * 4) / MENU.keys;

  return (
    <g transform={`translate(0 ${SCREEN.height - MENU.height - MENU.gap})`}>
      {MENU_KEYS.map((key, index) => {
        const x = MENU.gap + index * (width + MENU.gap);
        const selected = index === menuIndex;

        return (
          <g key={key} transform={`translate(${x} 0)`}>
            <rect
              width={width}
              height={MENU.height}
              fill={BLACK}
              stroke={selected ? CYAN : WHITE}
              strokeWidth={selected ? 5 : 3}
            />
            <text
              className="g5-menu-key"
              x={width / 2}
              y={MENU.height / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={selected ? CYAN : WHITE}
            >
              {LABELS[key]}
            </text>
          </g>
        );
      })}
    </g>
  );
};

const SelectModal = ({ title, value }) => (
  <g transform={`translate(${CENTER.x - 260} ${CENTER.y - 70})`}>
    <rect
      width={520}
      height={140}
      fill={BLACK}
      stroke={WHITE}
      strokeWidth={3}
    />
    <text
      className="g5-menu-title"
      x={260}
      y={44}
      textAnchor="middle"
      dominantBaseline="central"
      fill={WHITE}
    >
      {title}
    </text>
    <text
      className="g5-menu-value"
      x={260}
      y={98}
      textAnchor="middle"
      dominantBaseline="central"
      fill={CYAN}
    >
      {value}
    </text>
  </g>
);

const BacklightPage = () => {
  const { brightness, brightnessAuto } = useSettings();
  const width = 520;

  return (
    <g transform={`translate(${CENTER.x - width / 2} ${CENTER.y - 70})`}>
      <rect
        width={width}
        height={140}
        fill={BLACK}
        stroke={WHITE}
        strokeWidth={3}
      />
      <text
        className="g5-menu-title"
        x={width / 2}
        y={40}
        textAnchor="middle"
        dominantBaseline="central"
        fill={WHITE}
      >
        Backlight Intensity
      </text>
      {brightnessAuto ? (
        <text
          className="g5-menu-value"
          x={width / 2}
          y={96}
          textAnchor="middle"
          dominantBaseline="central"
          fill={CYAN}
        >
          Auto
        </text>
      ) : (
        <g transform={`translate(40 84)`}>
          <rect
            width={width - 80}
            height={24}
            fill="none"
            stroke={WHITE}
            strokeWidth={3}
          />
          <rect width={(width - 80) * brightness} height={24} fill={CYAN} />
        </g>
      )}
    </g>
  );
};

export default Menu;
