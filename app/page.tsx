"use client";

import {
  ArrowRightIcon,
  CornerLeftUp,
  MoveDiagonal,
  Pause,
  Play,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";
import Canvas from "./components/canvas";
import { useTSSolver } from "./hooks/useTSSolver";
import { createEdges, Edge, Point } from "./utils/point";
import { DEFAULT_CONFIG, TSPConfig } from "./utils/ts-solver";
import { TSVisualizer } from "./utils/ts-visualizer";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import assert from "assert";
import { ModeToggle } from "./components/mode-toggle";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "next-themes";

export default function Home() {
  const theme = useTheme();
  const solver = useTSSolver({ config: DEFAULT_CONFIG, n_points: 100 });
  const [triggerDraw, setTriggerDraw] = useState(false);

  function handleEdgeCreation(points: Point[]): Edge[] {
    if (solver.ready && solver.generationCount > 0) {
      return createEdges(points);
    }

    return [];
  }

  function handleDraw(ctx: CanvasRenderingContext2D) {
    if (triggerDraw) {
      const points = solver.fittestInd;
      const edges = handleEdgeCreation(points);
      TSVisualizer.draw(ctx, { points, edges }, theme.resolvedTheme);
      setTriggerDraw(false);
    }
  }

  useEffect(() => {
    setTriggerDraw(true);
  }, [solver.generationCount]);

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
          <div className="border-b p-2">
            <ModeToggle />
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">
              Genetic Traveling Salesman Solver
            </h1>
          </header>
          <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
            <ConfigForm solver={solver} />
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
              <Badge variant="outline" className="absolute right-3 top-3">
                Simulation
              </Badge>
              <Badge variant="secondary" className="absolute left-3 top-3">
                {solver.hasStarted
                  ? solver.isRunning
                    ? "Running"
                    : "Paused"
                  : "Init"}
              </Badge>
              <Canvas
                draw={handleDraw}
                className="size-full"
                width={1080}
                height={1080}
              />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

const DISTANCE_FUNCTIONS: Record<
  TSPConfig["distance_function"],
  {
    label: string;
    description: string;
    icon: JSX.Element;
  }
> = {
  euclidean: {
    label: "Euclidean",
    description: "Length of a line segment between the two points.",
    icon: <MoveDiagonal className="size-5" />,
  },
  manhattan: {
    label: "Manhattan",
    description:
      "Sum of the lengths of the projections of the line segment between the points onto the coordinate axes.",
    icon: <CornerLeftUp className="size-5" />,
  },
};

type ConfigFormProps = {
  solver: ReturnType<typeof useTSSolver>;
};

function ConfigForm({ solver }: ConfigFormProps) {
  return (
    <div
      className="relative hidden flex-col items-start gap-8 md:flex"
      x-chunk="dashboard-03-chunk-0"
    >
      <div className="grid w-full items-start gap-6">
        <fieldset className="grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>
          <div className="grid gap-3">
            <Label htmlFor="model">Distance Metric</Label>
            <Select
              defaultValue={solver.config.distance_function}
              disabled={solver.hasStarted}
              onValueChange={(val) => {
                assert(
                  val in DISTANCE_FUNCTIONS,
                  "value is a valid distance function"
                );
                solver.updateConfig({
                  ...solver.config,
                  distance_function: val as TSPConfig["distance_function"],
                });
              }}
            >
              <SelectTrigger
                id="model"
                className="items-start [&_[data-description]]:hidden"
              >
                <SelectValue placeholder="Select a distance function" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISTANCE_FUNCTIONS).map(
                  ([value, { label, description, icon }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-start gap-3 text-muted-foreground">
                        {icon}
                        <div className="grid gap-0.5">
                          <p>
                            <span className="font-medium text-foreground">
                              {label}
                            </span>
                          </p>
                          <p className="text-xs max-w-sm" data-description>
                            {description}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="points">Population Size</Label>
            <Input
              disabled={solver.hasStarted}
              id="population"
              type="number"
              min={3}
              max={1000}
              value={solver.config.n_population}
              onChange={(e) => {
                solver.updateConfig({
                  ...solver.config,
                  n_population: Number(e.target.value),
                });
              }}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="points">Individual Size</Label>
            <Input
              disabled={solver.hasStarted}
              id="points"
              type="number"
              min={3}
              max={100}
              value={solver.config.n_points}
              onChange={(e) => {
                solver.updateConfig({
                  ...solver.config,
                  n_points: Number(e.target.value),
                });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <Label htmlFor="top-p">Mutation Probability</Label>
              <Slider
                disabled={solver.hasStarted}
                id="top-k"
                min={0}
                max={1}
                step={0.1}
                defaultValue={[solver.config.p_mutation]}
                onValueChange={(val) => {
                  solver.updateConfig({
                    ...solver.config,
                    p_mutation: val[0],
                  });
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="top-k">Crossover Probability</Label>
              <Slider
                disabled={solver.hasStarted}
                id="top-k"
                min={0}
                max={1}
                step={0.1}
                defaultValue={[solver.config.p_crossover]}
                onValueChange={(val) => {
                  solver.updateConfig({
                    ...solver.config,
                    p_crossover: val[0],
                  });
                }}
              />
            </div>
          </div>
        </fieldset>
      </div>
      <div className="grid w-full items-start gap-6">
        <fieldset className="grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Simulation</legend>
          <div className="flex gap-3 justify-between">
            <div className="flex gap-3">
              {!solver.isRunning && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    solver.ready ? solver.play() : solver.start()
                  }
                >
                  <Play className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only"></span>
                </Button>
              )}
              {solver.isRunning && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => solver.pause()}
                >
                  <Pause className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only"></span>
                </Button>
              )}
              {solver.hasStarted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => solver.next()}
                >
                  <ArrowRightIcon className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              )}
            </div>
            {solver.hasStarted && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => solver.reset()}
              >
                <Square className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            )}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="top-k">Speed</Label>
            <Slider
              id="fps"
              min={1}
              max={120}
              step={1}
              defaultValue={[solver.config.speed]}
              onValueChange={(val) =>
                solver.updateConfig({ ...solver.config, speed: val[0] }, false)
              }
            />
          </div>
          {solver.hasStarted && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="top-k">Generation</Label>
                <div>{solver.generationCount}</div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="top-k">Best Distance</Label>
                <div>{Math.round(solver.fittest)}</div>
              </div>
            </div>
          )}
        </fieldset>
      </div>
    </div>
  );
}
