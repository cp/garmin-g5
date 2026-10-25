import { defaultProfile } from "../config/aircraft";
import { createFlightModel, step } from "./flightModel";
import { autopilotCommand, CAPTURE_BAND } from "./autopilot";

const settings = (overrides) => ({
  autopilot: true,
  selectedAltitude: 3000,
  selectedTrack: 360,
  ...overrides,
});

test("it does nothing when disengaged", () => {
  const model = createFlightModel(defaultProfile);

  expect(autopilotCommand(model, settings({ autopilot: false }))).toBeNull();
});

test("it pitches up to reach a higher selected altitude", () => {
  const model = { ...createFlightModel(defaultProfile), altitude: 2000 };

  expect(autopilotCommand(model, settings()).pitch).toBeGreaterThan(0);
});

test("it pitches down to reach a lower selected altitude", () => {
  const model = { ...createFlightModel(defaultProfile), altitude: 4000 };

  expect(autopilotCommand(model, settings()).pitch).toBeLessThan(0);
});

test("it annunciates ALT once inside the capture band", () => {
  const near = {
    ...createFlightModel(defaultProfile),
    altitude: 3000 - CAPTURE_BAND / 2,
  };
  const far = { ...createFlightModel(defaultProfile), altitude: 1000 };

  expect(autopilotCommand(near, settings()).modes.vertical).toBe("ALT");
  expect(autopilotCommand(far, settings()).modes.vertical).toBe("VNAV");
});

test("it banks towards the selected track, the short way round", () => {
  const model = { ...createFlightModel(defaultProfile), heading: 350 };
  const command = autopilotCommand(model, settings({ selectedTrack: 10 }));

  expect(command.roll).toBeGreaterThan(0);
});

test("it limits bank to a comfortable angle", () => {
  const model = { ...createFlightModel(defaultProfile), heading: 180 };
  const command = autopilotCommand(model, settings({ selectedTrack: 360 }));

  expect(Math.abs(command.roll)).toBeLessThanOrEqual(22);
});

test("it actually captures and holds the selected altitude", () => {
  const model = { ...createFlightModel(defaultProfile), altitude: 2400 };
  const config = settings();

  for (let elapsed = 0; elapsed < 240; elapsed += 1 / 30) {
    const command = autopilotCommand(model, config);
    step(model, 1 / 30, { ...command, power: 0.65, selectedTrack: 360 });
  }

  expect(Math.abs(model.altitude - config.selectedAltitude)).toBeLessThan(50);
});
