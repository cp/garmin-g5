import { clamp } from "./damp";

// A minimal autopilot: it exists so the mode annunciation bar, the selected
// altitude bug and the altitude alerter all mean something together. Lateral
// mode tracks the selected course, vertical mode captures and holds the
// selected altitude.

export const CAPTURE_BAND = 200; // feet, where ALT changes from capture to hold

export const autopilotCommand = (model, settings) => {
  if (!settings.autopilot) {
    return null;
  }

  const altitudeError = settings.selectedAltitude - model.altitude;

  // Chase the selected altitude at a sensible rate, easing off as it closes.
  const targetVsi = clamp(altitudeError * 6, -700, 700);
  const speedFactor = clamp(
    model.ias / model.profile.performance.cruiseSpeed,
    0.4,
    1.4,
  );
  const pitch = clamp(targetVsi / (110 * speedFactor), -10, 10);

  // Roll towards the selected track, limited to a gentle bank.
  const trackError =
    ((((settings.selectedTrack - model.heading) % 360) + 540) % 360) - 180;
  const roll = clamp(trackError * 1.2, -22, 22);

  return {
    pitch,
    roll,
    modes: {
      lateral: "GPS",
      vertical: Math.abs(altitudeError) <= CAPTURE_BAND ? "ALT" : "VNAV",
    },
  };
};
