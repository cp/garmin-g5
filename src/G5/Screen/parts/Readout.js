import React from "react";

import { BLACK, WHITE } from "../../config/palette";

// The black pointer boxes that hold the current value on each tape. The
// pointer is the notch on the side that aims at the tape.
const Readout = ({
  x,
  y,
  width,
  height,
  pointer = "right",
  stroke = WHITE,
  fill = BLACK,
  children,
}) => {
  const notch = 22;
  const mid = height / 2;

  const path =
    pointer === "right"
      ? `M 0 0 L ${width - notch} 0 L ${width} ${mid} L ${
          width - notch
        } ${height} L 0 ${height} Z`
      : `M ${notch} 0 L ${width} 0 L ${width} ${height} L ${notch} ${height} L 0 ${mid} Z`;

  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={path} fill={fill} stroke={stroke} strokeWidth={3} />
      {children}
    </g>
  );
};

export default Readout;
