import React from "react";

import Bezel from "./Bezel";
import Screen from "./Screen";

import "./G5.css";

const G5 = () => (
  <div className="G5">
    <div className="PrimaryContainer">
      <div className="Logo">GARMIN</div>
      <div className="ScreenContainer">
        <Screen />
      </div>
    </div>

    <Bezel />
  </div>
);

export default G5;
