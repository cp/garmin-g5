import React from "react";
import PropTypes from "prop-types";

import InstrumentContext from "./InstrumentContext";
import Screen from "./Screen";
import PowerIcon from "./PowerIcon";
import "./G5.css";

const G5 = (props) => (
  <div className="G5">
    <div className="PrimaryContainer">
      <div className="Logo">GARMIN</div>
      <div className="Screen">
        <InstrumentContext.Provider value={props}>
          <Screen />
        </InstrumentContext.Provider>
      </div>
    </div>

    <div className="Controls">
      <div className="Power">
        <PowerIcon />
      </div>
    </div>
  </div>
);

G5.propTypes = {
  pitch: PropTypes.number,
};

export default G5;
