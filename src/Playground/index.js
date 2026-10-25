import React from "react";

import G5 from "../G5";
import Backdrop from "./Backdrop";
import { useSimulation, useSettings } from "../G5/sim/SimContext";

import "./Playground.css";

const Slider = ({
  label,
  value,
  min,
  max,
  step = 1,
  format,
  disabled,
  onChange,
}) => (
  <label className={`Input${disabled ? " InputDisabled" : ""}`}>
    <span className="Label">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <span className="Value">{format ? format(value) : value}</span>
  </label>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="Toggle">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
    <span>{label}</span>
  </label>
);

// The sidebar flies the aircraft. Everything the real knob owns -- baro,
// selected altitude, track bug, brightness -- is reachable only through the
// knob, so no value has two control paths.
const Playground = () => {
  const simulation = useSimulation();
  const settings = useSettings();
  const { input, autopilot } = settings;

  const reset = () => {
    simulation.set({
      input: { pitch: 0, roll: 0, power: 0.65 },
      autopilot: false,
      failed: false,
      onExternalPower: true,
    });
  };

  return (
    <div className="Playground">
      <Backdrop />

      <div className="Sidebar">
        <div className="Header">Garmin G5</div>

        <div className="Inputs">
          <div className="Group">
            <div className="GroupTitle">Flight</div>
            <Slider
              label="Pitch"
              value={input.pitch}
              min={-20}
              max={20}
              disabled={autopilot}
              format={(v) => `${v}°`}
              onChange={(pitch) => simulation.setInput({ pitch })}
            />
            <Slider
              label="Bank"
              value={input.roll}
              min={-45}
              max={45}
              disabled={autopilot}
              format={(v) => `${v}°`}
              onChange={(roll) => simulation.setInput({ roll })}
            />
            <Slider
              label="Power"
              value={input.power}
              min={0}
              max={1}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(power) => simulation.setInput({ power })}
            />
            <Toggle
              label="Autopilot"
              checked={autopilot}
              onChange={(value) => simulation.set({ autopilot: value })}
            />
            {autopilot && (
              <p className="Hint">
                Holding the selected altitude and track. Set them with the knob.
              </p>
            )}
          </div>

          <div className="Group">
            <div className="GroupTitle">System</div>
            <Toggle
              label="Sensor failure"
              checked={settings.failed}
              onChange={(value) => simulation.set({ failed: value })}
            />
            <Toggle
              label="External power"
              checked={settings.onExternalPower}
              onChange={(value) => simulation.set({ onExternalPower: value })}
            />
            {!settings.onExternalPower && (
              <p className="Hint">
                Running on the internal battery, draining at 120x.
              </p>
            )}
          </div>
        </div>

        <div className="SidebarActions">
          <button className="Reset" onClick={reset}>
            Reset values
          </button>
        </div>
      </div>

      <div className="Container">
        <G5 />
      </div>
    </div>
  );
};

export default Playground;
