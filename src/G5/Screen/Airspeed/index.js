import React, { useContext } from "react";
import InstrumentContext from "../../InstrumentContext";

import "./Airspeed.css";

import Measure from "./Measure";

const Airspeed = () => {
  const { ias } = useContext(InstrumentContext);

  return (
    <div className="Airspeed">
      <Measure ias={ias} />

      <div className="AirspeedOverlay" />
      <div className="AirspeedTape" />
    </div>
  );
};

export default Airspeed;
