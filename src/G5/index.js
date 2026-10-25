import React from "react";

import InstrumentContext from "./InstrumentContext";
import Screen from "./Screen";
import PowerIcon from "./PowerIcon";

import "./G5.css";

const G5 = (props) => (
  <div className="G5">
    <div className="PrimaryContainer">
      <div className="Logo">GARMIN</div>
      <div className="ScreenContainer">
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

export default G5;
