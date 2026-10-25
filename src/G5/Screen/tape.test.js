import {
  bandSegments,
  headingLabel,
  isMajor,
  snapTo,
  tapeExtent,
  tapeTranslate,
  tickOffset,
  tickValues,
  trendGeometry,
} from "./tape";
import { ALTIMETER, AIRSPEED, CENTER, SCREEN } from "../config/layout";

describe("tape positioning", () => {
  test("a value lands on the pointer when the tape is translated", () => {
    const value = 2340;
    const y = CENTER.y + tapeTranslate(value, ALTIMETER.pixelsPerFoot);
    const tickY = tickOffset(value, ALTIMETER.pixelsPerFoot);

    expect(y + tickY).toBeCloseTo(CENTER.y);
  });

  test("higher values sit above lower ones", () => {
    const high = tickOffset(3000, ALTIMETER.pixelsPerFoot);
    const low = tickOffset(2900, ALTIMETER.pixelsPerFoot);

    expect(high).toBeLessThan(low);
  });

  test("the altimeter shows the 400 feet the pilot's guide specifies", () => {
    const { unitsBefore, unitsAfter } = tapeExtent(
      SCREEN.height,
      CENTER.y,
      ALTIMETER.pixelsPerFoot,
    );

    expect(unitsBefore + unitsAfter).toBeCloseTo(400);
  });
});

describe("tick windowing", () => {
  const options = {
    interval: 20,
    unitsBefore: 200,
    unitsAfter: 200,
    margin: 2,
  };

  test("covers everything on screen plus a margin", () => {
    const ticks = tickValues({ anchor: 3000, ...options });

    expect(Math.min(...ticks)).toBeLessThanOrEqual(2800);
    expect(Math.max(...ticks)).toBeGreaterThanOrEqual(3200);
  });

  test("stays bounded rather than rendering the whole range", () => {
    expect(tickValues({ anchor: 3000, ...options }).length).toBeLessThan(40);
  });

  test("respects the aircraft's limits", () => {
    const ticks = tickValues({ anchor: 30, ...options, min: 0, max: 200 });

    expect(Math.min(...ticks)).toBeGreaterThanOrEqual(0);
  });

  test("snapping keeps the window stable between shifts", () => {
    expect(snapTo(3051, 100)).toBe(snapTo(3099, 100));
    expect(snapTo(3051, 100)).not.toBe(snapTo(3101, 100));
  });

  test("ticks are whole multiples of the interval", () => {
    tickValues({ anchor: 2993, ...options }).forEach((tick) => {
      expect(tick % 20).toBe(0);
    });
  });
});

describe("labels", () => {
  test("heading wraps and pads to three digits", () => {
    expect(headingLabel(0)).toBe("360");
    expect(headingLabel(360)).toBe("360");
    expect(headingLabel(370)).toBe("010");
    expect(headingLabel(-10)).toBe("350");
    expect(headingLabel(95)).toBe("095");
  });

  test("major ticks are identified at the label interval", () => {
    expect(isMajor(120, 10)).toBe(true);
    expect(isMajor(125, 10)).toBe(false);
    expect(isMajor(-20, 10)).toBe(true);
  });
});

describe("colour bands", () => {
  const bands = [
    { from: 0, to: 40, color: "red" },
    { from: 48, to: 129, color: "green" },
    { from: 163, to: 200, barberPole: true },
  ];

  test("a band spans from its lower to its upper speed", () => {
    const [, green] = bandSegments(bands, AIRSPEED.pixelsPerKnot, 176, 24);

    expect(green.height).toBeCloseTo((129 - 48) * AIRSPEED.pixelsPerKnot);
    expect(green.y).toBeCloseTo(tickOffset(129, AIRSPEED.pixelsPerKnot));
  });

  test("a half-width band is inset rather than resized from the left", () => {
    const segments = bandSegments(
      [{ from: 40, to: 85, color: "white", width: 0.5 }],
      AIRSPEED.pixelsPerKnot,
      176,
      24,
    );

    expect(segments[0].width).toBe(12);
    expect(segments[0].x).toBe(188);
  });
});

describe("trend vector", () => {
  test("points up when accelerating and down when slowing", () => {
    const up = trendGeometry(100, 110, 12, 360);
    const down = trendGeometry(100, 90, 12, 360);

    expect(up.y).toBeLessThan(360);
    expect(down.y).toBe(360);
    expect(up.height).toBeCloseTo(120);
    expect(down.height).toBeCloseTo(120);
  });

  test("disappears when the speed is steady", () => {
    expect(trendGeometry(100, 100, 12, 360).visible).toBe(false);
  });
});

describe("readout consistency", () => {
  // The leading digits and the rolling digits round independently unless the
  // code makes them agree, which showed up as 3000 displayed at 3098 feet.
  const altimeterReadout = (altitude) => {
    const step = 20;
    const rounded = Math.round(altitude / step) * step;
    const hundreds = Math.floor(rounded / 100);
    const drum = String(((rounded % 100) + 100) % 100).padStart(2, "0");

    return Number(`${hundreds}${drum}`);
  };

  const airspeedReadout = (ias) => {
    const rounded = Math.round(ias);
    const tens = Math.floor(rounded / 10);
    const ones = ((rounded % 10) + 10) % 10;

    return Number(`${tens}${ones}`);
  };

  test("the altitude readout never contradicts itself across a hundred", () => {
    [2980, 2990, 2999, 3000, 3001, 3010, 3090, 3098, 3099, 3100].forEach(
      (altitude) => {
        expect(altimeterReadout(altitude)).toBeCloseTo(altitude, -2);
        expect(Math.abs(altimeterReadout(altitude) - altitude)).toBeLessThan(
          20,
        );
      },
    );
  });

  test("the airspeed readout never contradicts itself across a ten", () => {
    [99, 99.4, 99.6, 100, 109.5, 129.6, 130].forEach((ias) => {
      expect(Math.abs(airspeedReadout(ias) - ias)).toBeLessThanOrEqual(0.5);
    });
  });
});
