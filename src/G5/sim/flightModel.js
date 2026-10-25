import { clamp, damp, normalizeHeading } from "./damp";

// A kinematic model, deliberately not aerodynamics -- but an honest one about
// energy, because the layers that matter depend on it. The trend vector, the
// VSI, the turn rate indicator and the altitude alerter are only meaningful if
// the values are genuinely coupled.
//
// The two ideas that make it behave:
//
//   1. The aircraft does not fly where it points. Flight path angle is pitch
//      attitude minus angle of attack, and angle of attack rises as the square
//      of how far below trim speed you are. So at idle power and level pitch
//      the aircraft sinks, and keeps sinking harder as it slows.
//
//   2. Energy is conserved. Specific excess power is split between climbing
//      and accelerating: Ps = VSI + (V/g)(dV/dt). Whatever the pitch attitude
//      asks for in climb, the airspeed pays for out of the difference.
//
// Together these give the real behaviours for free: pull the power and you
// descend; hold the nose up with no power and you decelerate, the angle of
// attack climbs, and eventually you stall.

const G = 32.174; // ft/s^2
const FPM_PER_KNOT = 101.27; // a knot of vertical speed, in feet per minute
const KNOTS_TO_FPS = 1.68781;
const RATE_CONSTANT = 1091; // standard turn rate formula numerator

// Angle of attack at trim speed in level flight. Everything else scales off it.
const ALPHA_TRIM = 3;

// Specific excess power at full throttle and at idle, in feet per minute.
const POWER_AVAILABLE = 1800;
const DRAG_SINK = 1100;

export const createFlightModel = (profile) => ({
  profile,
  pitch: 0,
  roll: 0,
  power: 0.65,
  ias: profile.performance.cruiseSpeed,
  altitude: 3000,
  heading: 360,
  vsi: 0,
  turnRate: 0,
  slip: 0,
  iasRate: 0,
  alpha: ALPHA_TRIM,
  stalled: false,
  crossTrack: 0,
});

export const loadFactor = (roll) =>
  1 / Math.max(0.2, Math.cos((roll * Math.PI) / 180));

// The angle the wing has to meet the air at to hold the aircraft up. Lift goes
// with the square of speed, so halving the speed quadruples the angle needed;
// banking adds load factor on top.
export const angleOfAttack = (model) => {
  const { cruiseSpeed } = model.profile.performance;
  const speed = Math.max(20, model.ias);

  return ALPHA_TRIM * loadFactor(model.roll) * (cruiseSpeed / speed) ** 2;
};

// The wing stalls at the angle it would reach at Vs1 in level flight, which
// ties the stall to the aircraft profile rather than to a magic number.
export const stallAngle = (profile) =>
  ALPHA_TRIM * (profile.performance.cruiseSpeed / profile.vSpeeds.vs1) ** 2;

export const stallSpeed = (model) =>
  model.profile.vSpeeds.vs1 * Math.sqrt(loadFactor(model.roll));

// Where the aircraft is actually going, as opposed to where it is pointing.
export const flightPathAngle = (model) =>
  model.pitch - (angleOfAttack(model) - ALPHA_TRIM);

export const trueAirspeed = (model) =>
  model.ias * (1 + 0.02 * (model.altitude / 1000));

// Specific excess power: what is left over after drag, in feet per minute.
// Positive climbs, negative sinks, and it falls off with altitude.
export const excessPower = (model) => {
  const { cruiseSpeed, serviceCeiling } = model.profile.performance;
  const speedRatio = Math.max(0.2, model.ias / cruiseSpeed);
  const ceiling = clamp(1 - model.altitude / serviceCeiling, 0, 1);
  const drag = DRAG_SINK * (0.6 + 0.4 * speedRatio ** 3);

  return POWER_AVAILABLE * model.power * ceiling - drag;
};

export const step = (model, dt, command) => {
  const { vSpeeds, altitudeRange } = model.profile;

  // Control response: the commanded attitude is reached through a short lag
  // rather than instantly, so slider drags look like flying.
  const previousRoll = model.roll;
  model.pitch = damp(model.pitch, command.pitch, dt, 0.5);
  model.roll = damp(model.roll, command.roll, dt, 0.5);
  model.power = damp(model.power, command.power, dt, 1.5);

  model.alpha = angleOfAttack(model);
  model.stalled = model.alpha >= stallAngle(model.profile);

  // In a stall the nose drops whatever the pilot asked for, and the wing stops
  // producing the lift that was holding the flight path up.
  if (model.stalled) {
    model.pitch = damp(model.pitch, -10, dt, 0.7);
  }

  const gamma = flightPathAngle(model) - (model.stalled ? 7 : 0);
  const tas = Math.max(1, trueAirspeed(model));

  // Vertical speed follows the flight path, not the pitch attitude.
  const targetVsi = Math.sin((gamma * Math.PI) / 180) * tas * FPM_PER_KNOT;
  model.vsi = damp(model.vsi, targetVsi, dt, 0.8);

  model.altitude = clamp(
    model.altitude + (model.vsi / 60) * dt,
    altitudeRange.min,
    altitudeRange.max,
  );

  // Energy balance: whatever excess power is not spent climbing goes into
  // accelerating, and whatever the climb costs beyond it comes out of speed.
  const speedFps = Math.max(20, model.ias) * KNOTS_TO_FPS;
  model.iasRate =
    (((excessPower(model) - model.vsi) / 60) * G) / speedFps / KNOTS_TO_FPS;

  model.ias = clamp(model.ias + model.iasRate * dt, 0, vSpeeds.vne * 1.25);

  // A coordinated turn: rate falls as true airspeed rises.
  model.turnRate =
    (RATE_CONSTANT * Math.tan((model.roll * Math.PI) / 180)) / tas;
  model.heading = normalizeHeading(model.heading + model.turnRate * dt);

  // The ball swings while rolling in and out -- adverse yaw -- and centres in
  // steady flight.
  const rollRate = dt > 0 ? (model.roll - previousRoll) / dt : 0;
  model.slip = damp(model.slip, clamp(-rollRate * 0.03, -1, 1), dt, 0.35);

  // Cross-track error accumulates when the track diverges from the selected
  // course, which is what gives the CDI something true to show.
  const courseError =
    ((((command.selectedTrack - model.heading) % 360) + 540) % 360) - 180;
  model.crossTrack = clamp(
    model.crossTrack -
      Math.sin((courseError * Math.PI) / 180) * (tas / 3600) * dt,
    -10,
    10,
  );

  return model;
};

// The trend vector shows where airspeed will be in six seconds at the current
// rate of acceleration.
export const trendSpeed = (model) => model.ias + model.iasRate * 6;
