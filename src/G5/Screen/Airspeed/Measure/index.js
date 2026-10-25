import React from "react";

import NumberTape from "../../components/NumberTape";

import "./Measure.css";

const parseHundredsDigit = (ias) => {
  if (ias >= 100) {
    return parseInt(ias.toString()[0], 10);
  }

  return null;
};

const parseTensDigit = (ias) => {
  if (ias >= 100) {
    return parseInt(ias.toString()[1], 10);
  }

  if (ias >= 10) {
    return parseInt(ias.toString()[0], 10);
  }

  return null;
};

const parseOnesDigit = (ias) => {
  const str = ias.toString();

  return parseInt(str[str.length - 1], 10);
};

const Measure = ({ ias }) => {
  return (
    <div className="Measure">
      <div className="Caret" />
      <div className="MeasureInner">
        <div className="Digits">
          <span className="Digit">
            <NumberTape value={parseHundredsDigit(ias)} startAtOne />
          </span>
          <span className="Digit">
            <NumberTape value={parseTensDigit(ias)} startAtOne />
          </span>
          <span className="Digit OnesDigit">
            <NumberTape value={parseOnesDigit(ias)} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Measure;
