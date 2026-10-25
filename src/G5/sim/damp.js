// Frame-rate independent exponential smoothing. A displayed value chases its
// target with a time constant, which is critically damped by construction: it
// never overshoots, which is what separates an instrument from a UI spring.
export const damp = (current, target, dt, timeConstant) => {
  if (timeConstant <= 0) {
    return target;
  }

  return target + (current - target) * Math.exp(-dt / timeConstant);
};

// Same, for a value on a 0-360 circle: smooth the short way round.
export const dampAngle = (current, target, dt, timeConstant) => {
  const delta = ((((target - current) % 360) + 540) % 360) - 180;

  return normalizeHeading(damp(0, delta, dt, timeConstant) + current);
};

export const normalizeHeading = (deg) => ((deg % 360) + 360) % 360;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
