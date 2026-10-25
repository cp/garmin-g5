import { defaultProfile } from "../config/aircraft";
import {
  angleOfAttack,
  createFlightModel,
  excessPower,
  flightPathAngle,
  stallAngle,
  stallSpeed,
  step,
  trendSpeed,
  trueAirspeed,
} from "./flightModel";

const fly = (model, command, seconds, dt = 1 / 30) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += dt) {
    step(model, dt, { power: 0.65, selectedTrack: 360, ...command });
  }

  return model;
};

const level = { pitch: 0, roll: 0 };

describe("the envelope is enforced", () => {
  test("airspeed decays in a climb and builds in a dive", () => {
    const climb = fly(
      createFlightModel(defaultProfile),
      { ...level, pitch: 10 },
      60,
    );
    const dive = fly(
      createFlightModel(defaultProfile),
      { ...level, pitch: -10 },
      60,
    );

    expect(climb.ias).toBeLessThan(defaultProfile.performance.cruiseSpeed);
    expect(dive.ias).toBeGreaterThan(defaultProfile.performance.cruiseSpeed);
  });

  test("VNE is reachable pointed down at full power", () => {
    const model = fly(
      createFlightModel(defaultProfile),
      { ...level, pitch: -20, power: 1 },
      120,
    );

    expect(model.ias).toBeGreaterThan(defaultProfile.vSpeeds.vne);
  });

  test("the aircraft stalls and sinks at idle with the nose up", () => {
    const model = fly(
      createFlightModel(defaultProfile),
      { ...level, pitch: 15, power: 0 },
      90,
    );

    expect(model.stalled).toBe(true);
    expect(model.vsi).toBeLessThan(0);
  });

  test("stall speed rises with bank angle", () => {
    const wingsLevel = createFlightModel(defaultProfile);
    const banked = { ...createFlightModel(defaultProfile), roll: 60 };

    expect(stallSpeed(banked)).toBeGreaterThan(stallSpeed(wingsLevel));
    // A 60 degree bank doubles the load factor, so Vs rises by root two.
    expect(stallSpeed(banked) / stallSpeed(wingsLevel)).toBeCloseTo(
      Math.SQRT2,
      1,
    );
  });
});

describe("the values are coupled", () => {
  test("pitching up climbs and gains altitude", () => {
    const model = createFlightModel(defaultProfile);
    const start = model.altitude;
    fly(model, { ...level, pitch: 6 }, 30);

    expect(model.vsi).toBeGreaterThan(0);
    expect(model.altitude).toBeGreaterThan(start);
  });

  test("standard rate needs about 14 degrees of bank at 90 knots", () => {
    // rate = 1091 * tan(bank) / TAS, so the bank for a standard rate turn
    // depends on speed: shallow when slow, steep when fast.
    const model = { ...createFlightModel(defaultProfile), ias: 90, roll: 14 };
    step(model, 0, { ...level, roll: 14, power: 0.5, selectedTrack: 360 });

    expect(Math.abs(model.turnRate)).toBeCloseTo(3, 0);
  });

  test("the same bank turns more slowly the faster you go", () => {
    const slow = { ...createFlightModel(defaultProfile), ias: 80, roll: 25 };
    const fast = { ...createFlightModel(defaultProfile), ias: 160, roll: 25 };
    const command = { ...level, roll: 25, power: 0.6, selectedTrack: 360 };

    step(slow, 0, command);
    step(fast, 0, command);

    expect(Math.abs(slow.turnRate)).toBeGreaterThan(Math.abs(fast.turnRate));
  });

  test("banking changes heading in the direction of the turn", () => {
    const turned = (roll) => {
      const model = fly(
        createFlightModel(defaultProfile),
        { ...level, roll },
        10,
      );
      // Heading wraps through 360, so compare the signed change.
      return ((((model.heading - 360) % 360) + 540) % 360) - 180;
    };

    expect(turned(20)).toBeGreaterThan(5);
    expect(turned(-20)).toBeLessThan(-5);
  });

  test("heading always stays within 0 to 360", () => {
    const model = fly(
      createFlightModel(defaultProfile),
      { ...level, roll: 30 },
      300,
    );

    expect(model.heading).toBeGreaterThanOrEqual(0);
    expect(model.heading).toBeLessThan(360);
  });

  test("true airspeed exceeds indicated as altitude increases", () => {
    const model = {
      ...createFlightModel(defaultProfile),
      altitude: 10000,
      ias: 100,
    };

    expect(trueAirspeed(model)).toBeGreaterThan(model.ias);
  });

  test("the trend vector predicts six seconds ahead", () => {
    const model = {
      ...createFlightModel(defaultProfile),
      ias: 100,
      iasRate: 2,
    };

    expect(trendSpeed(model)).toBeCloseTo(112);
  });

  test("altitude is held inside the aircraft's range", () => {
    const model = fly(
      createFlightModel(defaultProfile),
      { ...level, pitch: -20, power: 1 },
      600,
    );

    expect(model.altitude).toBeGreaterThanOrEqual(
      defaultProfile.altitudeRange.min,
    );
  });
});

describe("energy, not just pitch attitude", () => {
  test("pulling the power descends, even at level pitch", () => {
    const model = createFlightModel(defaultProfile);
    const start = model.altitude;
    fly(model, { ...level, power: 0 }, 45);

    expect(model.vsi).toBeLessThan(-200);
    expect(model.altitude).toBeLessThan(start - 100);
  });

  test("holding the nose up at idle ends in a stall", () => {
    const model = createFlightModel(defaultProfile);
    let stalled = false;

    // Sampled over the run, because once it breaks the nose drops, speed
    // recovers and it buffets in and out rather than staying stalled.
    for (let elapsed = 0; elapsed < 60; elapsed += 1 / 30) {
      step(model, 1 / 30, {
        ...level,
        pitch: 8,
        power: 0,
        selectedTrack: 360,
      });
      stalled = stalled || model.stalled;
    }

    expect(stalled).toBe(true);
    expect(model.ias).toBeLessThan(defaultProfile.vSpeeds.vs1 + 3);
    expect(model.vsi).toBeLessThan(0);
  });

  test("the nose drops by itself when the wing stalls", () => {
    const model = { ...createFlightModel(defaultProfile), ias: 45, pitch: 10 };
    step(model, 0.5, { ...level, pitch: 10, power: 0, selectedTrack: 360 });

    expect(model.stalled).toBe(true);
    expect(model.pitch).toBeLessThan(10);
  });

  test("the aircraft sinks below the attitude it is pointing at", () => {
    const slow = { ...createFlightModel(defaultProfile), ias: 60, pitch: 0 };

    // Pointing level but well below trim speed: the flight path is downhill.
    expect(flightPathAngle(slow)).toBeLessThan(-3);
  });

  test("angle of attack rises as speed falls, and with bank", () => {
    const fast = { ...createFlightModel(defaultProfile), ias: 140 };
    const slow = { ...createFlightModel(defaultProfile), ias: 60 };
    const banked = { ...createFlightModel(defaultProfile), ias: 60, roll: 45 };

    expect(angleOfAttack(slow)).toBeGreaterThan(angleOfAttack(fast));
    expect(angleOfAttack(banked)).toBeGreaterThan(angleOfAttack(slow));
  });

  test("the stall angle corresponds to the profile's clean stall speed", () => {
    const atVs1 = {
      ...createFlightModel(defaultProfile),
      ias: defaultProfile.vSpeeds.vs1,
    };

    expect(angleOfAttack(atVs1)).toBeCloseTo(stallAngle(defaultProfile), 5);
  });

  test("a steep turn at cruise power descends, because bank costs lift", () => {
    const model = createFlightModel(defaultProfile);
    const start = model.altitude;
    fly(model, { ...level, roll: 45 }, 40);

    // The pilot is holding pitch attitude, not altitude, so the extra angle of
    // attack the bank demands is paid for out of height.
    expect(model.altitude).toBeLessThan(start);
    expect(model.vsi).toBeLessThan(0);
  });

  test("excess power is positive at full throttle and negative at idle", () => {
    const model = createFlightModel(defaultProfile);

    expect(excessPower({ ...model, power: 1 })).toBeGreaterThan(0);
    expect(excessPower({ ...model, power: 0 })).toBeLessThan(0);
  });

  test("full power from cruise climbs at roughly the book rate", () => {
    const model = createFlightModel(defaultProfile);
    fly(model, { ...level, pitch: 7, power: 1 }, 60);

    expect(model.vsi).toBeGreaterThan(300);
    expect(model.vsi).toBeLessThan(1200);
  });

  test("a glide at idle settles rather than running away", () => {
    const model = createFlightModel(defaultProfile);
    fly(model, { ...level, pitch: -4, power: 0 }, 120);

    expect(model.ias).toBeGreaterThan(45);
    expect(model.ias).toBeLessThan(110);
    expect(model.vsi).toBeGreaterThan(-1400);
  });
});
