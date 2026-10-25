import React, { useRef } from "react";

import PowerIcon from "./PowerIcon";

const HOLD_MS = 650;

// Press turns the unit on, or opens the backlight page if it is already on.
// Press and hold powers it off, as on the real bezel.
const PowerButton = ({ onPress, onHold }) => {
  const timer = useRef(null);
  const held = useRef(false);

  const down = () => {
    held.current = false;
    timer.current = window.setTimeout(() => {
      held.current = true;
      onHold();
    }, HOLD_MS);
  };

  const up = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }

    if (!held.current) {
      onPress();
    }
  };

  return (
    <button
      type="button"
      className="Power"
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      aria-label="Power"
    >
      <PowerIcon />
    </button>
  );
};

export default PowerButton;
