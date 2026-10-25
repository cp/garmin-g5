import { useEffect, useMemo, useState } from "react";

import { snapTo, tickValues } from "./tape";

// Windowed tapes are the one place React stays in the loop: the tick list is
// rebuilt when the window shifts, which for the altimeter is about every
// hundred feet. Between those shifts the group just translates.
export const useTickWindow = (value, { step, ...options }) => {
  const [anchor, setAnchor] = useState(() => snapTo(value.get(), step));

  useEffect(
    () =>
      value.on("change", (next) => {
        const snapped = snapTo(next, step);
        setAnchor((previous) => (previous === snapped ? previous : snapped));
      }),
    [value, step],
  );

  return useMemo(
    () => tickValues({ anchor, ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      anchor,
      options.interval,
      options.unitsBefore,
      options.unitsAfter,
      options.min,
      options.max,
    ],
  );
};
