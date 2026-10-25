import React, { useEffect, useState } from "react";

import { useSettings } from "../sim/SimContext";

// A development aid, not a feature: it lays a photograph of a real G5 over the
// rendered screen so geometry can be checked against the actual device rather
// than against memory. The image is deliberately not committed -- see
// reference/README.md -- so the toggle disappears when it is absent.
const SOURCE = `${process.env.PUBLIC_URL}/reference/g5-pfd.png`;

export const useReferenceAvailable = () => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const image = new Image();

    image.onload = () => !cancelled && setAvailable(true);
    image.onerror = () => !cancelled && setAvailable(false);
    image.src = SOURCE;

    return () => {
      cancelled = true;
    };
  }, []);

  return available;
};

const ReferenceOverlay = () => {
  const { overlay, overlayOpacity } = useSettings();
  const available = useReferenceAvailable();

  if (!overlay || !available) {
    return null;
  }

  return (
    <img
      className="ReferenceOverlay"
      src={SOURCE}
      alt=""
      style={{ opacity: overlayOpacity }}
    />
  );
};

export default ReferenceOverlay;
