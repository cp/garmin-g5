import {
  batteryColor,
  CAUTION_MINUTES,
  formatBatteryTime,
  FULL_MINUTES,
  stepBattery,
  WARN_MINUTES,
} from "./battery";

test("time remaining is formatted as hours and minutes", () => {
  expect(formatBatteryTime(240)).toBe("4:00");
  expect(formatBatteryTime(91)).toBe("1:31");
  expect(formatBatteryTime(38)).toBe("0:38");
  expect(formatBatteryTime(-5)).toBe("0:00");
});

test("the icon walks green to yellow to red", () => {
  expect(batteryColor(FULL_MINUTES)).toBe("#00cc00");
  expect(batteryColor(WARN_MINUTES - 1)).toBe("#f2f200");
  expect(batteryColor(CAUTION_MINUTES - 1)).toBe("#e00000");
});

test("it drains on battery and recovers on external power", () => {
  const battery = { minutes: FULL_MINUTES, fault: false, empty: false };

  stepBattery(battery, 10, false);
  const drained = battery.minutes;
  expect(drained).toBeLessThan(FULL_MINUTES);

  stepBattery(battery, 10, true);
  expect(battery.minutes).toBeGreaterThan(drained);
});

test("it never drains below empty, and reports the state", () => {
  const battery = { minutes: 1, fault: false, empty: false };
  stepBattery(battery, 600, false);

  expect(battery.minutes).toBe(0);
  expect(battery.empty).toBe(true);
  expect(battery.fault).toBe(true);
});
