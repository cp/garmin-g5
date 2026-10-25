// The G5 carries an internal battery good for about four hours. Drain runs
// accelerated here so the indicator actually walks green to yellow to red,
// and so BATT and NO BATT are states you can reach rather than switches.

export const FULL_MINUTES = 240;
export const DRAIN_MULTIPLIER = 120; // four hours of battery in two minutes

export const WARN_MINUTES = 120;
export const CAUTION_MINUTES = 45;
export const FAULT_MINUTES = 10;

export const batteryColor = (minutes) => {
  if (minutes <= CAUTION_MINUTES) return "#e00000";
  if (minutes <= WARN_MINUTES) return "#f2f200";

  return "#00cc00";
};

export const formatBatteryTime = (minutes) => {
  const whole = Math.max(0, Math.floor(minutes));

  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

export const stepBattery = (battery, dt, onExternalPower) => {
  if (onExternalPower) {
    // Recharges faster than it drains, so the demo recovers.
    battery.minutes = Math.min(
      FULL_MINUTES,
      battery.minutes + (dt / 60) * DRAIN_MULTIPLIER * 2,
    );
  } else {
    battery.minutes = Math.max(
      0,
      battery.minutes - (dt / 60) * DRAIN_MULTIPLIER,
    );
  }

  battery.fault = !onExternalPower && battery.minutes <= FAULT_MINUTES;
  battery.empty = battery.minutes <= 0;

  return battery;
};
