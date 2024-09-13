import {
  CanvasHTMLAttributes,
  DetailedHTMLProps,
  useEffect,
  useRef,
} from "react";

type CanvasProps = {
  draw: (ctx: CanvasRenderingContext2D, frameCount: number) => void;
} & DetailedHTMLProps<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
>;

/**
 * Simple canvas component which allows you to draw on it.
 *
 * @source https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
 */
export default function Canvas({ draw, ...props }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("Canvas not found");
      return;
    }

    const context = canvas.getContext("2d");

    let frameCount = 0;
    let animationFrameId: number;

    function render() {
      frameCount++;
      if (!context) {
        console.log("Context not found");
        return;
      }

      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    }
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return <canvas ref={canvasRef} {...props} />;
}
