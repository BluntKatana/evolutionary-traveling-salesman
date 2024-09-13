import { Point, Edge, calcCanvasCoords } from "./point";

const LINE_WIDTH = 1;
const POINT_RADIUS = 10;

/**
 * Traveling Salesman Visualizer
 *
 * A class which helps visualize the Traveling Salesman Problem.
 * Containing canvas drawing functions and other utilities.
 */
export class TSVisualizer {
  static draw(
    ctx: CanvasRenderingContext2D,
    { points, edges }: { points: Point[]; edges: Edge[] }
  ) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.lineWidth = LINE_WIDTH;

    this.drawPoints(ctx, points);
    this.drawEdges(ctx, edges);
  }

  private static drawPoints(ctx: CanvasRenderingContext2D, points: Point[]) {
    for (const point of points) {
      const relativePoint = calcCanvasCoords(point, ctx.canvas);

      ctx.beginPath();
      ctx.arc(relativePoint.x, relativePoint.y, POINT_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private static drawEdges(ctx: CanvasRenderingContext2D, edges: Edge[]) {
    for (const edge of edges) {
      const a = calcCanvasCoords(edge.a, ctx.canvas);
      const b = calcCanvasCoords(edge.b, ctx.canvas);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
}
