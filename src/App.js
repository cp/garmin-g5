import React from "react";

import Playground from "./Playground";
import { SimProvider } from "./G5/sim/SimContext";

import "./App.css";

const App = () => (
  <div className="App">
    <SimProvider>
      <Playground />
    </SimProvider>
  </div>
);

export default App;
