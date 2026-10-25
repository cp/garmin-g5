// All screen geometry lives on a 960x720 grid: the G5's real 320x240 display
// at 3x, so the 4:3 aspect is locked and one scale factor covers every size.
//
// These numbers are measured, not estimated. They were read off the reference
// figures in the G5 pilot's guide (Garmin 190-01112-12) and converted to this
// grid:
//
//   Pitch ladder      11.04 px per degree, marks every 2.5 degrees
//   Mark half-widths  24 / 50 / 74 px at 2.5 / 5 / 10 degrees
//   Roll arc          radius 262, centred on the aircraft symbol
//   Airspeed tape     12 px per knot, labels every 10 kt
//   Altitude tape     1.8 px per foot, which gives the 400 ft the guide
//                     specifies as the amount visible at once
//   Heading tape      15.1 px per degree
//   Vertical speed    0.216 px per fpm, +/- 1500 fpm

export const SCREEN = { width: 960, height: 720 };

// The aircraft symbol sits at the centre of the screen, and the roll arc is
// centred on it.
export const CENTER = { x: 480, y: 360 };

export const ATTITUDE = {
  pixelsPerDegree: 11.04,
  // The white horizon line is part of the pitch scale and is shorter than the
  // sky/ground boundary, which runs the full width.
  horizonHalfWidth: 168,
  // Pitch marks occur every 2.5 degrees; the length of the mark encodes which.
  markInterval: 2.5,
  markHalfWidth: { 2.5: 24, 5: 50, 10: 74 },
  labelInterval: 10,
  labelOffset: 128,
  rollRadius: 262,
  rollMajorTicks: [30, 60],
  rollMinorTicks: [10, 20, 45],
  rollTickLength: { major: 26, minor: 17 },
  rollPointerSize: 20,
  // Red chevrons appear beyond these pitch attitudes.
  chevronAbove: 60,
  chevronBelow: -40,
};

export const AIRSPEED = {
  pixelsPerKnot: 12,
  labelInterval: 10,
  minorInterval: 5,
  labelRight: 124,
  tickRight: 176,
  tickLength: { major: 28, minor: 16 },
  bandLeft: 176,
  bandWidth: 24,
  trendLeft: 206,
  trendWidth: 10,
  readout: { x: 0, width: 168, height: 86 },
  bugX: 200,
  unitsX: 14,
};

export const ALTIMETER = {
  pixelsPerFoot: 1.8,
  labelInterval: 100,
  minorInterval: 20,
  labelLeft: 752,
  tickLeft: 704,
  tickLength: { major: 32, minor: 16 },
  readout: { x: 736, width: 224, height: 86 },
  selected: { x: 712, y: 4, width: 200, height: 56 },
  baro: { x: 704, y: 664, width: 224, height: 52 },
  // Vertical deviation scale, between the attitude and the altitude tape.
  deviation: { x: 664, width: 36, height: 420 },
};

export const VSI = {
  pixelsPerFpm: 0.216,
  range: 1500,
  labelInterval: 500,
  minorInterval: 100,
  left: 904,
  width: 56,
  pointerWidth: 44,
};

export const HEADING = {
  pixelsPerDegree: 15.1,
  labelInterval: 10,
  minorInterval: 5,
  height: 60,
  tickLength: { major: 14, minor: 8 },
  readout: { width: 88, height: 40 },
};

export const CDI = { x: 312, y: 568, width: 336, height: 36, dots: 2 };

export const SLIP = { y: 632, width: 44, height: 52, travel: 88 };

export const TURN_RATE = { y: 700, halfWidth: 240, standardRateDegPerSec: 3 };

export const GROUND_SPEED = { x: 0, y: 664, width: 168, height: 52 };

export const BATTERY = { x: 0, y: 4, width: 168, height: 44 };

export const AUTOPILOT_BAR = { y: 664, height: 52 };

export const MENU = { height: 76, keys: 3, gap: 8 };
