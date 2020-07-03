import React, { useState } from "react";

import G5 from "../G5";

import "./Playground.css";

const Playground = () => {
  const [pitch, setPitch] = useState(0);
  const [roll, setRoll] = useState(0);
  const [ias, setIAS] = useState(0);

  return (
    <div className="Playground">
      <div className="Sidebar">
        <div className="Header">Garmin G5</div>

        <div className="Inputs">
          <div className="Input">
            <div className="Label">Pitch</div>

            <div className="Control">
              <input
                type="range"
                min="-30"
                max="30"
                value={pitch}
                onChange={(e) => setPitch(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="Input">
            <div className="Label">Roll</div>

            <div className="Control">
              <input
                type="range"
                min="-45"
                max="45"
                value={roll}
                onChange={(e) => setRoll(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="Input">
            <div className="Label">Airspeed</div>

            <div className="Control">
              <input
                type="number"
                min="0"
                max="250"
                value={ias}
                onChange={(e) => setIAS(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="Container">
        <G5 pitch={pitch} roll={roll} ias={ias} />
      </div>
    </div>
  );
};

export default Playground;
