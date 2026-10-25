// An aircraft profile supplies everything the display cannot know on its own:
// the V-speeds that get bugs, the boundaries of the airspeed colour bands, and
// the units the tapes are labelled in.
//
// The shape is open for more profiles; one C172-class trainer ships.

const c172 = {
  name: "C172S",
  units: { speed: "KT", altitude: "FT", pressure: "inHg" },

  // Indicated airspeeds in knots.
  vSpeeds: {
    vs0: 40, // stall, flaps extended
    vs1: 48, // stall, clean
    vr: 55, // rotate
    vx: 62, // best angle of climb
    vg: 68, // best glide
    vy: 79, // best rate of climb
    vfe: 85, // max flaps extended
    va: 105, // manoeuvring
    vno: 129, // max structural cruising
    vne: 163, // never exceed
  },

  // Which V-speeds get a bug on the tape, and in what colour.
  vSpeedBugs: [
    { key: "vx", label: "X", color: "#00ffff" },
    { key: "vy", label: "Y", color: "#00ffff" },
    { key: "vg", label: "G", color: "#00cc00" },
    { key: "va", label: "A", color: "#ffffff" },
  ],

  // The colour range strip, bottom to top. "barberPole" is the red and white
  // hatching above VNE.
  speedBands: [
    { from: 0, to: 40, color: "#e00000" },
    { from: 40, to: 85, color: "#ffffff", width: 0.5 },
    { from: 48, to: 129, color: "#00cc00" },
    { from: 129, to: 163, color: "#f2f200" },
    { from: 163, to: 200, barberPole: true },
  ],

  airspeedRange: { min: 20, max: 200 },
  altitudeRange: { min: -1400, max: 30000 },

  // Rough performance figures for the kinematic model, not aerodynamics.
  performance: {
    cruiseSpeed: 110, // kt at cruise power, level
    maxSpeed: 180,
    climbRate: 730, // ft/min at Vy, full power
    serviceCeiling: 14000,
    speedLag: 6, // seconds for airspeed to chase its target
  },

  // Vertical speed indicator range: 1500, 2000 or 3000 fpm.
  vsiRange: 1500,
};

export const profiles = { c172 };

export const defaultProfile = c172;
