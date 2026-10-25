import { motionValue } from "motion";
import { frame, cancelFrame } from "motion";

import { defaultProfile } from "../config/aircraft";
import { clamp, damp, dampAngle, normalizeHeading } from "./damp";
import {
  createFlightModel,
  step,
  trendSpeed,
  trueAirspeed,
} from "./flightModel";
import { autopilotCommand } from "./autopilot";
import { stepBattery, FULL_MINUTES } from "./battery";

// Power-up runs through the real sequence, compressed: the device takes up to
// a minute to align, which nobody wants to watch twice.
export const POWER_PHASES = [
  { name: "splash", seconds: 1.2 },
  { name: "aligningWings", seconds: 1.8 },
  { name: "aligning", seconds: 2.0 },
];

// How quickly each displayed value chases the truth. The VSI is deliberately
// the laggiest, as it is on the real instrument.
const TIME_CONSTANTS = {
  pitch: 0.12,
  roll: 0.12,
  ias: 0.3,
  altitude: 0.22,
  vsi: 0.9,
  heading: 0.18,
  turnRate: 0.4,
  slip: 0.3,
  trend: 0.6,
  deviation: 0.5,
};

const defaultSettings = (profile) => ({
  // The unit powers up with the aircraft, so the alignment sequence is the
  // first thing you see. The power button can take it down and back up again.
  phase: "splash",
  failed: false,
  onExternalPower: true,
  batteryFault: false,
  batteryEmpty: false,
  baro: 29.92,
  selectedAltitude: 3000,
  selectedTrack: 360,
  autopilot: false,
  apModes: null,
  brightness: 1,
  brightnessAuto: false,
  menu: null,
  menuIndex: 0,
  input: { pitch: 0, roll: 0, power: 0.65 },
  profile,
});

export const createSimulation = (profile = defaultProfile) => {
  const model = createFlightModel(profile);
  const battery = { minutes: FULL_MINUTES, fault: false, empty: false };

  let settings = defaultSettings(profile);
  let listeners = new Set();
  let phaseElapsed = 0;
  let running = false;

  const values = {
    pitch: motionValue(0),
    roll: motionValue(0),
    ias: motionValue(model.ias),
    altitude: motionValue(model.altitude),
    vsi: motionValue(0),
    heading: motionValue(model.heading),
    turnRate: motionValue(0),
    slip: motionValue(0),
    trend: motionValue(model.ias),
    groundSpeed: motionValue(model.ias),
    trueAirspeed: motionValue(model.ias),
    crossTrack: motionValue(0),
    deviation: motionValue(0),
    batteryMinutes: motionValue(FULL_MINUTES),
  };

  const emit = () => listeners.forEach((listener) => listener());

  const update = (changes) => {
    settings = { ...settings, ...changes };
    emit();
  };

  // --- power and alignment ------------------------------------------------

  const phaseIndex = () =>
    POWER_PHASES.findIndex((phase) => phase.name === settings.phase);

  const advancePhase = (dt) => {
    const index = phaseIndex();
    if (index === -1) {
      return;
    }

    phaseElapsed += dt;
    if (phaseElapsed < POWER_PHASES[index].seconds) {
      return;
    }

    phaseElapsed = 0;
    const next = POWER_PHASES[index + 1];
    update({ phase: next ? next.name : "on" });
  };

  const powerOn = () => {
    phaseElapsed = 0;
    update({ phase: POWER_PHASES[0].name, menu: null });
  };

  const powerOff = () => {
    phaseElapsed = 0;
    update({ phase: "off", menu: null });
  };

  // --- the frame loop -----------------------------------------------------

  const tick = ({ delta }) => {
    // A tab that has been in the background hands back an enormous delta;
    // clamping it stops the aircraft teleporting on return.
    const dt = Math.min(delta, 100) / 1000;

    stepBattery(battery, dt, settings.onExternalPower);
    values.batteryMinutes.set(battery.minutes);

    if (
      battery.fault !== settings.batteryFault ||
      battery.empty !== settings.batteryEmpty
    ) {
      update({ batteryFault: battery.fault, batteryEmpty: battery.empty });
    }

    // A dead battery with no external power takes the display with it.
    if (
      battery.empty &&
      !settings.onExternalPower &&
      settings.phase !== "off"
    ) {
      powerOff();
      return;
    }

    if (settings.phase === "off") {
      return;
    }

    advancePhase(dt);

    const autopilot = autopilotCommand(model, settings);
    const command = {
      pitch: autopilot ? autopilot.pitch : settings.input.pitch,
      roll: autopilot ? autopilot.roll : settings.input.roll,
      power: settings.input.power,
      selectedTrack: settings.selectedTrack,
    };

    step(model, dt, command);

    const modes = autopilot ? autopilot.modes : null;
    if (JSON.stringify(modes) !== JSON.stringify(settings.apModes)) {
      update({ apModes: modes });
    }

    const tc = TIME_CONSTANTS;
    values.pitch.set(damp(values.pitch.get(), model.pitch, dt, tc.pitch));
    values.roll.set(damp(values.roll.get(), model.roll, dt, tc.roll));
    values.ias.set(damp(values.ias.get(), model.ias, dt, tc.ias));
    values.altitude.set(
      damp(values.altitude.get(), model.altitude, dt, tc.altitude),
    );
    values.vsi.set(damp(values.vsi.get(), model.vsi, dt, tc.vsi));
    values.heading.set(
      dampAngle(values.heading.get(), model.heading, dt, tc.heading),
    );
    values.turnRate.set(
      damp(values.turnRate.get(), model.turnRate, dt, tc.turnRate),
    );
    values.slip.set(damp(values.slip.get(), model.slip, dt, tc.slip));
    values.trend.set(damp(values.trend.get(), trendSpeed(model), dt, tc.trend));

    const tas = trueAirspeed(model);
    values.trueAirspeed.set(tas);
    values.groundSpeed.set(tas);
    values.crossTrack.set(
      damp(values.crossTrack.get(), model.crossTrack, dt, tc.deviation),
    );
    values.deviation.set(
      damp(
        values.deviation.get(),
        clamp(settings.selectedAltitude - model.altitude, -500, 500),
        dt,
        tc.deviation,
      ),
    );
  };

  return {
    values,
    model,

    start() {
      if (running) return;
      running = true;
      frame.update(tick, true);
    },

    stop() {
      if (!running) return;
      running = false;
      cancelFrame(tick);
    },

    getSettings: () => settings,
    subscribe(listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },

    set: update,
    setInput: (input) => update({ input: { ...settings.input, ...input } }),

    powerOn,
    powerOff,
    isAwake: () => settings.phase !== "off",
    isAligned: () => settings.phase === "on",
    normalizeHeading,
  };
};
