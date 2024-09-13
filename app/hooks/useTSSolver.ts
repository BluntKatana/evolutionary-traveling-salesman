import { useState } from "react";
import {
  computeDistance,
  fittestSolutionTSP,
  initializePopulation,
  runStep,
  TSPConfig,
} from "../utils/ts-solver";
import { Point } from "../utils/point";

export interface UseTSSolverOptions {
  config: TSPConfig;
  n_points: number;
}

export const useTSSolver = (options: UseTSSolverOptions) => {
  const [generationCount, setGenerationCount] = useState<number>(0);
  const [generation, setGeneration] = useState<Point[][]>([]);
  const [fittestInd, setFittestInd] = useState<Point[]>([]);
  const [fittest, setFittest] = useState<number>(Number.MAX_SAFE_INTEGER);

  function init() {
    const population = initializePopulation(
      options.config.n_population,
      options.n_points
    );
    setGeneration(population);

    const [bestFitNew, bestIndvidualNew] = fittestSolutionTSP(
      computeDistance,
      population
    );

    setFittest(bestFitNew);
    setFittestInd(bestIndvidualNew);
  }

  function next() {
    const newGeneration = runStep(options.config, generation);
    setGeneration(newGeneration);
    setGenerationCount((prev) => prev + 1);

    const [bestFitNew, bestIndvidualNew] = fittestSolutionTSP(
      computeDistance,
      newGeneration
    );

    if (bestFitNew < fittest) {
      console.log("New fittest", bestFitNew);
      setFittest(bestFitNew);
      setFittestInd(bestIndvidualNew);
    }
  }

  return {
    generation,
    generationCount,
    fittest,
    fittestInd,
    ready: generation.length > 0,
    init,
    next,
  };
};
