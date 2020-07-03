import React, { useContext } from "react";
import InstrumentContext from "../../InstrumentContext";

import "./ArtificialHorizon.css";

const ArtificialHorizon = () => {
  const { pitch, roll } = useContext(InstrumentContext);
  const style = {
    transform: `scale(2) translateY(${pitch}px) rotate(${roll}deg)`,
  };

  return (
    <div className="ArtificialHorizon" style={style}>
      <div className="Sky" />
      <div className="Horizon" />
      <div className="Ground" />
    </div>
  );
};

export default ArtificialHorizon;
