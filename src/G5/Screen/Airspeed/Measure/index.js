import React from "react";

import "./Measure.css";

const parseHundredsDigit = (ias) => {
  if (ias >= 100) {
    return ias.toString()[0];
  }

  return null;
};

const parseTensDigit = (ias) => {
  if (ias >= 100) {
    return ias.toString()[1];
  }

  if (ias >= 10) {
    return ias.toString()[0];
  }

  return null;
};

const parseOnesDigit = (ias) => {
  const str = ias.toString();

  return str[str.length - 1];
};

const Measure = ({ ias }) => {
  return (
    <div className="Measure">
      <div className="Caret" />
      <div className="MeasureInner">
        <div className="Digits">
          <span className="Digit">{parseHundredsDigit(ias)}</span>
          <span className="Digit">{parseTensDigit(ias)}</span>
          <span className="Digit OnesDigit">{parseOnesDigit(ias)}</span>
        </div>
      </div>
    </div>
  );
};

export default Measure;
