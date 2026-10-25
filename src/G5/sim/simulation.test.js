import { createSimulation } from "./simulation";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("the frame loop runs and advances the power-up sequence", async () => {
  const simulation = createSimulation();

  expect(simulation.getSettings().phase).toBe("splash");

  simulation.start();
  await wait(1600);
  const afterSplash = simulation.getSettings().phase;
  await wait(4200);
  const afterAlignment = simulation.getSettings().phase;
  simulation.stop();

  expect(afterSplash).toBe("aligningWings");
  expect(afterAlignment).toBe("on");
}, 15000);
