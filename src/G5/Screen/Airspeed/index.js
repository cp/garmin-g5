import React, { useContext } from "react";
import InstrumentContext from "../../InstrumentContext";

import "./Airspeed.css";

const Airspeed = () => {
  const { ias } = useContext(InstrumentContext);

  return (
    <div className="Airspeed">
      <div className="Measure">{ias}</div>

      <div className="Overlay" />
      <div className="Tape" />
    </div>
  );
};

export default Airspeed;
