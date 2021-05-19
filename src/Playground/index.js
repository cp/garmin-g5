import React, { useState } from "react";

import G5 from "../G5";

import "./Playground.css";

const minIAS = 0;
const maxIAS = 250;

const parseAndValidateIAS = (value) => {
  if (value === "") {
    return minIAS;
  }

  const parsed = parseInt(value);

  if (parsed > maxIAS) {
    return maxIAS;
  }

  if (parsed < minIAS) {
    return minIAS;
  }

  return parsed;
};

const defaultValues = {
  pitch: 0,
  roll: 0,
  ias: 0,
};

const Playground = () => {
  const [pitch, setPitch] = useState(defaultValues.pitch);
  const [roll, setRoll] = useState(defaultValues.roll);
  const [ias, setIAS] = useState(defaultValues.ias);

  const resetValues = () => {
    setPitch(defaultValues.pitch);
    setRoll(defaultValues.roll);
    setIAS(defaultValues.ias);
  };

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
                min={minIAS.toString()}
                max={maxIAS.toString()}
                value={ias}
                onChange={(e) => setIAS(parseAndValidateIAS(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="SidebarActions">
          <button className="Reset" onClick={() => resetValues()}>
            Reset values
          </button>
        </div>
      </div>

      <div className="Container">
        <G5 pitch={pitch} roll={roll} ias={ias} />
      </div>
    </div>
  );
};

export default Playground;
