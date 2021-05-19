import React from "react";

import ArtificialHorizon from "./ArtificialHorizon";
import Airspeed from "./Airspeed";
import Altimeter from "./Altimeter";
import "./Screen.css";

const Screen = () => (
  <div className="Screen">
    <ArtificialHorizon />
    <Airspeed />
    <Altimeter />
  </div>
);

export default Screen;
