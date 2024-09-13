export type Point = {
  x: number;
  y: number;
};

export type Edge = {
  a: Point;
  b: Point;
};

const MAX_X = 1000;
const MAX_Y = 1000;
const POINT_SIZE = 5;

/**
 * Distance between two points is the Manhatten distance
 * between them on a 2D plane.
 */
export function getManhattanDist(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Distance between two points is the Euclidean distance
 */
export function getEuclideanDist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Generate a random point */
function randomPoint(): Point {
  // Generate a random x and y coordinate
  // which is between 0 + POINT_SIZE and MAX_X/Y - POINT_SIZE
  const x = Math.round(Math.random() * (MAX_X - 2 * POINT_SIZE) + POINT_SIZE);
  const y = Math.round(Math.random() * (MAX_Y - 2 * POINT_SIZE) + POINT_SIZE);

  return { x, y };
}

/** Generate random array of n points */
export function randomPoints(n: number): Point[] {
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push(randomPoint());
  }

  return points;
}

/** Generate a path of edges based on the array of points */
export function createEdges(points: Point[]): Edge[] {
  const edges = [];
  for (let i = 0; i < points.length - 1; i++) {
    edges.push({ a: points[i], b: points[i + 1] });
  }

  // Add the edge from the last point to the first point
  edges.push({ a: points[points.length - 1], b: points[0] });

  return edges;
}

// ################
// # CANVAS UTILS #
// ################

/**
 * Calculates the canvas coordinates of a point.
 * Where canvas.width = MAX_X and canvas.height = MAX_Y
 * @param point
 * @param canvas
 */
export function calcCanvasCoords(
  point: Point,
  canvas: { width: number; height: number }
): Point {
  const widthConversion = canvas.width / MAX_X;
  const heightConversion = canvas.height / MAX_Y;

  return {
    x: point.x * widthConversion,
    y: point.y * heightConversion,
  };
}

export function toKey(point: Point): string {
  return `${point.x}-${point.y}`;
}

export function fromKey(key: string): Point {
  const [x, y] = key.split("-").map(Number);
  return { x, y };
}
