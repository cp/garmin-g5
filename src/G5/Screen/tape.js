// Tape geometry, kept as pure functions so it can be tested. These are the
// calculations that go silently wrong rather than visibly wrong.

export const snapTo = (value, step) => Math.floor(value / step) * step;

// A moving tape is drawn once at static coordinates and then translated, so a
// tick for `value` always sits at the same place in the group.
export const tickOffset = (value, pixelsPerUnit) => -value * pixelsPerUnit;

export const tapeTranslate = (value, pixelsPerUnit) => value * pixelsPerUnit;

// Which ticks can be seen, plus a margin so none pop in at the edges. Anchored
// on a snapped value so the list only changes when the window really moves.
export const tickValues = ({
  anchor,
  interval,
  unitsBefore,
  unitsAfter,
  min = -Infinity,
  max = Infinity,
  margin = 2,
}) => {
  const from =
    Math.floor((anchor - unitsBefore) / interval) * interval -
    interval * margin;
  const to =
    Math.ceil((anchor + unitsAfter) / interval) * interval + interval * margin;

  const ticks = [];
  for (let value = from; value <= to; value += interval) {
    const rounded = Math.round(value / interval) * interval;
    if (rounded >= min && rounded <= max) {
      ticks.push(rounded);
    }
  }

  return ticks;
};

// How many units of tape fit above and below the pointer.
export const tapeExtent = (height, center, pixelsPerUnit) => ({
  unitsBefore: center / pixelsPerUnit,
  unitsAfter: (height - center) / pixelsPerUnit,
});

export const isMajor = (value, majorInterval) =>
  Math.abs(value % majorInterval) < 1e-6 ||
  Math.abs(Math.abs(value % majorInterval) - majorInterval) < 1e-6;

// Heading labels wrap and are always three digits: 360, 010, 090.
export const headingLabel = (degrees) => {
  const wrapped = ((Math.round(degrees) % 360) + 360) % 360;

  return String(wrapped === 0 ? 360 : wrapped).padStart(3, "0");
};

// The colour range strip is described per aircraft as overlapping bands; this
// turns it into drawable segments in tape coordinates.
export const bandSegments = (bands, pixelsPerUnit, left, width) =>
  bands.map((band) => ({
    ...band,
    y: tickOffset(band.to, pixelsPerUnit),
    height: (band.to - band.from) * pixelsPerUnit,
    x: left + (1 - (band.width || 1)) * width,
    width: width * (band.width || 1),
  }));

// The trend vector runs from the current speed to the predicted speed, so it
// can point either way and has no length when speed is steady.
export const trendGeometry = (current, predicted, pixelsPerUnit, center) => {
  const height = Math.abs(predicted - current) * pixelsPerUnit;
  const y = predicted > current ? center - height : center;

  return { y, height, visible: height > 1 };
};

// Splits an altitude into the part that is displayed as a plain number and the
// part that rolls, matching the G5's readout.
export const splitAltitude = (altitude) => {
  const rounded = Math.round(altitude);
  const hundreds =
    Math.floor(Math.abs(rounded) / 100) * Math.sign(rounded || 1);

  return { hundreds, remainder: altitude - hundreds * 100 };
};
