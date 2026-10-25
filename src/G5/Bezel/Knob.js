import React, { useCallback, useRef, useState } from "react";

const DETENT_DEGREES = 11;
const HOLD_MS = 550;

// A knob you turn: drag around it, or use the wheel. Rotation accumulates
// until it crosses a detent, which is what a real knob does and what keeps a
// drag from firing a hundred steps.
const Knob = ({ onStep, onPress, onHold, size = 112 }) => {
  const ref = useRef(null);
  const dragging = useRef(false);
  const lastAngle = useRef(0);
  const accumulated = useRef(0);
  const moved = useRef(false);
  const holdTimer = useRef(null);
  const [rotation, setRotation] = useState(0);

  const angleAt = (event) => {
    const box = ref.current.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);

    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const applyDelta = useCallback(
    (delta) => {
      accumulated.current += delta;
      setRotation((previous) => previous + delta);

      while (Math.abs(accumulated.current) >= DETENT_DEGREES) {
        const direction = Math.sign(accumulated.current);
        accumulated.current -= direction * DETENT_DEGREES;
        onStep(direction);
      }
    },
    [onStep],
  );

  const handlePointerDown = (event) => {
    event.preventDefault();
    ref.current.setPointerCapture(event.pointerId);
    dragging.current = true;
    moved.current = false;
    lastAngle.current = angleAt(event);

    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      moved.current = true; // a hold is not a press
      onHold();
    }, HOLD_MS);
  };

  const handlePointerMove = (event) => {
    if (!dragging.current) {
      return;
    }

    const angle = angleAt(event);
    let delta = angle - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (Math.abs(delta) > 0.5) {
      moved.current = true;
      if (holdTimer.current) {
        window.clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
    }

    lastAngle.current = angle;
    applyDelta(delta);
  };

  const handlePointerUp = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }

    if (dragging.current && !moved.current) {
      onPress();
    }

    dragging.current = false;
    accumulated.current = 0;
  };

  const handleWheel = (event) => {
    event.preventDefault();
    applyDelta(Math.sign(event.deltaY) * DETENT_DEGREES);
  };

  return (
    <div
      ref={ref}
      className="Knob"
      style={{ width: size, height: size }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      role="slider"
      tabIndex={0}
      aria-label="G5 knob"
      aria-valuenow={Math.round(rotation)}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowRight") onStep(1);
        if (event.key === "ArrowDown" || event.key === "ArrowLeft") onStep(-1);
        if (event.key === "Enter" || event.key === " ") onPress();
      }}
    >
      <div className="KnobFace" style={{ transform: `rotate(${rotation}deg)` }}>
        <span className="KnobGrip" />
      </div>
    </div>
  );
};

export default Knob;
