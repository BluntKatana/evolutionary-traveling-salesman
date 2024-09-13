import { getEuclideanDist, Point, randomPoints, toKey } from "./point";

export function computeDistance(route: Point[]): number {
  if (route.length < 2) {
    return 0;
  }

  let distance = 0;
  for (let i = 0; i < route.length - 2; i++) {
    distance += getEuclideanDist(route[i], route[i + 1]);
  }

  // Add the distance from the last point to the first point
  distance += getEuclideanDist(route[route.length - 1], route[0]);

  return distance;
}

export function fittestSolutionTSP(
  distFunction: (route: Point[]) => number,
  generation: Point[][]
): [number, Point[]] {
  let bestFitness = Number.MAX_SAFE_INTEGER;
  let bestFitnessIndividual: Point[] = [];

  for (const individual of generation) {
    const fitnessIndividual = distFunction(individual);
    if (fitnessIndividual < bestFitness) {
      bestFitness = fitnessIndividual;
      bestFitnessIndividual = individual;
    }
  }

  return [bestFitness, bestFitnessIndividual];
}

export function initializePopulation(
  n_population: number,
  n_points: number
): Point[][] {
  const population = [];
  for (let i = 0; i < n_population; i++) {
    population.push(randomPoints(n_points));
  }

  return population;
}

function mutation(child: Point[], p_mutation: number): Point[] {
  if (Math.random() < p_mutation) {
    const i = Math.floor(Math.random() * child.length);
    const j = Math.floor(Math.random() * child.length);

    const temp = child[i];
    child[i] = child[j];
    child[j] = temp;
  }

  return child;
}

function findNeighboursBasedOnIndex(parent: Point[], i: number) {
  const neighbours = [];
  if (i > 0) {
    neighbours.push(parent[i - 1]);
  }
  if (i < parent.length - 1) {
    neighbours.push(parent[i + 1]);
  }
  return neighbours;
}

function createOffspringEdgeRecombination(
  parent1: Point[],
  parent2: Point[]
): Point[] {
  // Create edge table
  const edgeTable: Record<string, Point[]> = {};

  // initialize edge table
  for (let i = 0; i < parent1.length; i++) {
    edgeTable[toKey(parent1[i])] = [];
  }
  for (let i = 0; i < parent2.length; i++) {
    edgeTable[toKey(parent2[i])] = [];
  }

  // Fill edge table
  for (let i = 0; i < parent1.length; i++) {
    const neighbours = findNeighboursBasedOnIndex(parent1, i);
    for (const neighbour of neighbours) {
      edgeTable[toKey(parent1[i])].push(neighbour);
    }
  }

  for (let i = 0; i < parent2.length; i++) {
    const neighbours = findNeighboursBasedOnIndex(parent2, i);
    for (const neighbour of neighbours) {
      edgeTable[toKey(parent2[i])].push(neighbour);
    }
  }

  let current = parent1[Math.floor(Math.random() * parent1.length)];
  const child = [current];

  while (child.length < parent1.length) {
    // remove current point from others' edge tables
    for (const key of Object.keys(edgeTable)) {
      edgeTable[key] = edgeTable[key].filter((point) => point !== current);
    }

    let nextPoint: Point;

    const currentEdge = edgeTable[toKey(current)];
    // if current point has neighbours, choose the one with least amount of neighbours
    if (currentEdge && currentEdge.length > 0) {
      nextPoint = currentEdge.reduce((a, b) => {
        const aNeighbours = edgeTable[toKey(a)].length;
        const bNeighbours = edgeTable[toKey(b)].length;
        return aNeighbours < bNeighbours ? a : b;
      });
    } else {
      // if no neighbours left, choose a random unvisited point which is
      // not part of the child or the current point
      const unvisited = parent1.filter(
        (point) => !child.includes(point) && point !== current
      );
      nextPoint = unvisited[Math.floor(Math.random() * unvisited.length)];
      if (!nextPoint) {
        console.log("!! Undefined value found - random");
        console.log({ current, child, parent1 });
      }
    }

    // add the chosen point to the child
    child.push(nextPoint);
    // previous new points is now the last chosen one
    current = nextPoint;
  }

  return child;
}

function crossover(
  parent1: Point[],
  parent2: Point[],
  p_crossover: number
): [Point[], Point[]] {
  if (Math.random() < p_crossover) {
    // return [parent1, parent2];
    const child1 = createOffspringEdgeRecombination(parent1, parent2);
    const child2 = createOffspringEdgeRecombination(parent1, parent2);

    return [child1, child2];
  }

  return [parent1, parent2];
}

function tournament_selection(
  generation: Point[][],
  distanceFunction: (route: Point[]) => number,
  tournament_size: number
): number {
  const participants: Set<number> = new Set();

  while (participants.size < tournament_size) {
    participants.add(Math.floor(Math.random() * generation.length));
  }

  const fitnessValues = Array.from(participants).map((i) =>
    distanceFunction(generation[i])
  );

  return Array.from(participants)[
    fitnessValues.indexOf(Math.min(...fitnessValues))
  ];
}

export type TSPConfig = {
  n_population: number;
  p_mutation: number;
  p_crossover: number;
  n_iter: number;
  tournament_size: number;
  number_of_children: number;
};

export const DEFAULT_CONFIG: TSPConfig = {
  n_population: 100,
  p_mutation: 0.2,
  p_crossover: 0.8,
  n_iter: 1000,
  tournament_size: 10,
  number_of_children: 2,
};

export function runStep(config: TSPConfig, generation: Point[][]) {
  const number_of_parents = Math.floor(
    config.n_population / config.number_of_children
  );

  const new_generation = [];

  for (let j = 0; j < number_of_parents; j += 1) {
    const mating_pool = [];

    for (let k = 0; k < config.number_of_children; k += 1) {
      const mate = tournament_selection(
        generation,
        computeDistance,
        config.tournament_size
      );
      mating_pool.push(mate);
    }

    let [child1, child2] = [
      generation[mating_pool[0]],
      generation[mating_pool[1]],
    ];

    [child1, child2] = crossover(child1, child2, config.p_crossover);

    child1 = mutation(child1, config.p_mutation);
    child2 = mutation(child2, config.p_mutation);

    new_generation.push(child1);
    new_generation.push(child2);
  }

  return new_generation;
}

export function run(config: TSPConfig) {
  const number_of_parents = config.n_population / config.number_of_children;

  // initialize the generation
  let generation = initializePopulation(config.n_population, 10);

  // compute the current best solution
  let [best_fit_old, best_ind_old] = fittestSolutionTSP(
    computeDistance,
    generation
  );

  if (config.n_population > 100) {
    throw new Error("Population size is greater then 100");
  } else if (config.n_iter > 1000) {
    throw new Error("Number of iterations is greater then 1000");
  }

  for (let i = 1; i < config.n_iter; i += 1) {
    // initialize the list of new generation
    const new_generation = [];

    // loop over number of parent pairs we need to get
    for (let j = 0; j < number_of_parents; j += 1) {
      const mating_pool = [];
      for (let k = 0; k < config.number_of_children; k += 1) {
        const mate = tournament_selection(
          generation,
          computeDistance,
          config.tournament_size
        );
        mating_pool.push(mate);
      }

      let [child1, child2] = [
        generation[mating_pool[0]],
        generation[mating_pool[1]],
      ];

      [child1, child2] = crossover(child1, child2, config.p_crossover);

      child1 = mutation(child1, config.p_mutation);
      child2 = mutation(child2, config.p_mutation);

      new_generation.push(child1);
      new_generation.push(child2);
    }

    generation = new_generation;

    const [best_fit_new, best_ind_new] = fittestSolutionTSP(
      computeDistance,
      generation
    );

    if (best_fit_new < best_fit_old) {
      best_fit_old = best_fit_new;
      best_ind_old = best_ind_new;
    }

    console.log(`Best distance: ${best_fit_old} ${best_ind_old}`);
  }
}
