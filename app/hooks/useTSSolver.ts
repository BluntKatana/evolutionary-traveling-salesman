import { useCallback, useEffect, useState } from "react";
import {
  computeDistance,
  fittestSolutionTSP,
  initializePopulation,
  runStep,
  TSPConfig,
} from "../utils/ts-solver";
import { Point, randomPoints } from "../utils/point";

export interface UseTSSolverOptions {
  config: TSPConfig;
  n_points: number;
}

export const useTSSolver = (options: UseTSSolverOptions) => {
  const [points, setPoints] = useState<Point[]>(randomPoints(options.n_points));

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [config, setConfig] = useState<TSPConfig>(options.config);

  const [generationCount, setGenerationCount] = useState<number>(0);
  const [generation, setGeneration] = useState<Point[][]>([]);
  const [fittestInd, setFittestInd] = useState<Point[]>([]);
  const [fittest, setFittest] = useState<number>(Number.MAX_SAFE_INTEGER);

  const init = useCallback(() => {
    console.log("Initializing");
    const population = initializePopulation(config.n_population, points);
    setGeneration(population);

    console.log(population.length, population[0]?.length);

    const [bestFitNew, bestIndvidualNew] = fittestSolutionTSP(
      computeDistance,
      population,
      config.distance_function
    );

    setFittest(bestFitNew);
    setFittestInd(bestIndvidualNew);
  }, [config.n_population, config.distance_function, points]);

  const next = useCallback(() => {
    setHasStarted(true);
    const newGeneration = runStep(config, generation);
    setGeneration(newGeneration);
    setGenerationCount((prev) => prev + 1);

    const [bestFitNew, bestIndvidualNew] = fittestSolutionTSP(
      computeDistance,
      newGeneration,
      config.distance_function
    );

    if (bestFitNew < fittest) {
      setFittest(bestFitNew);
      setFittestInd(bestIndvidualNew);
    }
  }, [config, generation, fittest]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    setPoints(randomPoints(config.n_points));
  }, [config.n_points]);

  function start() {
    init();
    play();
  }

  function play() {
    setIsRunning(true);
  }

  function pause() {
    setIsRunning(false);
  }

  function reset() {
    setIsRunning(false);
    setHasStarted(false);
    setGenerationCount(0);
    setGeneration([]);
    setFittest(Number.MAX_SAFE_INTEGER);
    setFittestInd([]);
  }

  function updateConfig(newConfig: TSPConfig, reset = true) {
    setConfig(newConfig);
    if (reset) {
      init();
    }
  }

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        next();
      }, 1000 / config.speed);

      return () => {
        clearInterval(interval);
      };
    }
  }, [config.speed, isRunning, next]);

  return {
    generation,
    generationCount,
    fittest,
    fittestInd,
    ready: generation.length > 0,
    init,
    next,
    updateConfig,
    config,

    isRunning,
    play,
    pause,
    reset,
    hasStarted,
    start,
  };
};
