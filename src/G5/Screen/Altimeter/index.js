import React, { useContext } from "react";
import InstrumentContext from "../../InstrumentContext";

import "./Altimeter.css";

const Altimeter = () => {
  const { altitude } = useContext(InstrumentContext);

  return (
    <div className="Altimeter">
      {altitude}
      <div className="AltimeterOverlay" />
      <div className="AltimeterTape" />
    </div>
  );
};

export default Altimeter;
