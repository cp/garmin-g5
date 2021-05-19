import React from "react";

import "./Altimeter.css";

const Altimeter = () => {
  return (
    <div className="Altimeter">
      0
      <div className="AltimeterOverlay" />
      <div className="AltimeterTape" />
    </div>
  );
};

export default Altimeter;
