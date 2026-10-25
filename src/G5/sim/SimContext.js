import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import { createSimulation } from "./simulation";

const SimContext = createContext(null);

export const SimProvider = ({ children }) => {
  const simulation = useMemo(() => createSimulation(), []);

  useEffect(() => {
    simulation.start();

    return () => simulation.stop();
  }, [simulation]);

  return (
    <SimContext.Provider value={simulation}>{children}</SimContext.Provider>
  );
};

export const useSimulation = () => useContext(SimContext);

// Discrete settings re-render React when they change. Continuous values never
// do -- they are read through the binding hooks instead.
export const useSettings = () => {
  const simulation = useSimulation();

  return useSyncExternalStore(simulation.subscribe, simulation.getSettings);
};

export const useValues = () => useSimulation().values;
