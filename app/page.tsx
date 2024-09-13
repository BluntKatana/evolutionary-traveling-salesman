"use client";

import { useEffect, useState } from "react";
import Canvas from "./components/canvas";
import { useTSSolver } from "./hooks/useTSSolver";
import { createEdges, Edge } from "./utils/point";
import { DEFAULT_CONFIG } from "./utils/ts-solver";
import { TSVisualizer } from "./utils/ts-visualizer";

export default function Home() {
  const solver = useTSSolver({ config: DEFAULT_CONFIG, n_points: 100 });
  const [edges, setEdges] = useState<Edge[]>([]);
  const [update, setUpdate] = useState(false);

  function handleDraw(ctx: CanvasRenderingContext2D, frameCount: number) {
    if (update) {
      const points = solver.fittestInd;
      TSVisualizer.draw(ctx, { points, edges });
      setUpdate(false);
    }
    if (frameCount % 2 === 0) {
      handleNextGeneration();
    }
  }

  function handleNextGeneration() {
    if (!solver.ready) {
      solver.init();
    } else {
      solver.next();
    }
  }

  useEffect(() => {
    if (solver.ready) {
      setEdges(createEdges(solver.fittestInd));
      setUpdate(true);
    }
  }, [solver.fittestInd, solver.fittest, solver.ready]);

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold">Traveling Salesman Problem</h1>
      {solver.ready && (
        <div className="space-y-2">
          <div>Distance: {Math.round(solver.fittest)}</div>
          <div>Generation: {solver.generationCount}</div>
        </div>
      )}
      <button
        onClick={() => handleNextGeneration()}
        className="px-4 py-2 mt-4 text-white bg-blue-500 rounded-md"
      >
        {solver.ready ? "Next Generation" : "Start"}
      </button>
      <Canvas
        draw={handleDraw}
        className="size-full"
        width={1920}
        height={1080}
      />
    </div>
  );
}
