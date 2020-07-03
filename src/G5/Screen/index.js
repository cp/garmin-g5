import React from "react";

import ArtificialHorizon from "./ArtificialHorizon";
import Airspeed from "./Airspeed";
import "./Screen.css";

const Screen = () => (
  <div className="Screen">
    <ArtificialHorizon />
    <Airspeed />
  </div>
);

export default Screen;
