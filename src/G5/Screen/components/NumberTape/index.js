import React from "react";

import "./NumberTape.css";

const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const getArraySibling = (value, offset) => {
  const length = numbers.length;

  return numbers[(value + offset + length) % length];
};

const getValuesToRender = (value, startAtOne) => {
  if (value === null && startAtOne) {
    return [null, null, null];
  }

  return [getArraySibling(value, -1), value, getArraySibling(value, 1)];
};

const NumberTape = ({ value, startAtOne }) => {
  const valuesToRender = getValuesToRender(value, startAtOne);

  return (
    <div className="NumberTape">
      <div className="NumberTapeInner">
        {valuesToRender.map((val, index) => (
          <span className="NumberTapeDigit" key={index}>
            {val}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NumberTape;
