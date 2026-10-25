import React from "react";

import { useSimulation, useSettings } from "../sim/SimContext";
import { MENU_KEYS } from "../Screen/layers/Menu";
import Knob from "./Knob";
import PowerButton from "./PowerButton";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// The bezel owns everything the pilot can physically touch. Which value the
// knob is editing depends on what is on screen, exactly as it does on the
// real unit: baro when nothing is open, the cursor when the menu is up, the
// value itself inside a selection page.
const Bezel = () => {
  const simulation = useSimulation();
  const settings = useSettings();
  const { menu, menuIndex, phase } = settings;

  const step = (direction) => {
    if (phase === "off") {
      return;
    }

    if (menu === "main") {
      simulation.set({
        menuIndex: clamp(menuIndex + direction, 0, MENU_KEYS.length - 1),
      });

      return;
    }

    if (menu === "track") {
      simulation.set({
        selectedTrack:
          (((settings.selectedTrack + direction) % 360) + 360) % 360,
      });

      return;
    }

    if (menu === "altitude") {
      simulation.set({
        selectedAltitude: clamp(
          settings.selectedAltitude + direction * 100,
          -1000,
          30000,
        ),
      });

      return;
    }

    if (menu === "backlight") {
      simulation.set({
        brightness: clamp(settings.brightness + direction * 0.05, 0.1, 1),
        brightnessAuto: false,
      });

      return;
    }

    // Nothing open: the knob sets the barometric pressure.
    simulation.set({
      baro: Number(
        clamp(settings.baro + direction * 0.01, 27.5, 31.5).toFixed(2),
      ),
    });
  };

  const press = () => {
    if (phase === "off") {
      return;
    }

    if (!menu) {
      simulation.set({ menu: "main", menuIndex: 0 });

      return;
    }

    if (menu === "main") {
      const key = MENU_KEYS[menuIndex];
      simulation.set({ menu: key === "back" ? null : key });

      return;
    }

    // Inside a selection page or the backlight page, pressing goes back.
    simulation.set({ menu: menu === "backlight" ? null : "main" });
  };

  // Press and hold syncs the selected value to the current one.
  const hold = () => {
    if (menu === "track") {
      simulation.set({
        selectedTrack: Math.round(simulation.values.heading.get()),
      });
    }

    if (menu === "altitude") {
      simulation.set({
        selectedAltitude:
          Math.round(simulation.values.altitude.get() / 100) * 100,
      });
    }
  };

  const powerPress = () => {
    if (phase === "off") {
      simulation.powerOn();

      return;
    }

    simulation.set({ menu: menu === "backlight" ? null : "backlight" });
  };

  return (
    <div className="Controls">
      <PowerButton onPress={powerPress} onHold={() => simulation.powerOff()} />

      <div className="BezelSpacer">
        <span className="CardSlot" />
        <span className="LightSensor" />
      </div>

      <Knob onStep={step} onPress={press} onHold={hold} />
    </div>
  );
};

export default Bezel;
