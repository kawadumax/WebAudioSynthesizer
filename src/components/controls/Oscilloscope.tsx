import style from "@styles/controls/Oscilloscope.module.scss";
import { useEffect, useRef } from "react";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";

interface Props {
  className?: string;
}

const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"; // 薄い白色の罫線
  ctx.lineWidth = 0.5;

  const gridSpacing = 25; // 罫線の間隔

  // 横罫線
  for (let y = gridSpacing; y < canvas.height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 縦罫線
  for (let x = gridSpacing; x < canvas.width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
};

const drawInsetShadow = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.save();

  // シャドウプロパティを設定
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 30;
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";

  // 外向きのシャドウを持つ矩形を描画
  ctx.fillStyle = "black";
  ctx.fillRect(-canvas.width, 0, canvas.width, canvas.height);
  ctx.fillRect(-canvas.width, -canvas.height, canvas.width, canvas.height);
  ctx.fillRect(0, -canvas.height, canvas.width, canvas.height);

  ctx.restore();
};

const Oscilloscope = ({ className = "" }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engine, isReady } = useAudioEngine();

  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = engine.getAnalyser();
    if (!canvas || !analyser) return;

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let rafId = 0;
    const updateFrame = () => {
      rafId = requestAnimationFrame(updateFrame);
      analyser.getByteTimeDomainData(dataArray);

      canvasContext.fillStyle = "#282c34";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      drawGrid(canvasContext, canvas);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "#61dafb";
      canvasContext.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
      drawInsetShadow(canvasContext, canvas);
    };

    updateFrame();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [engine, isReady]);

  return (
    <div className={className ? `${className} ${style.Oscilloscope}` : style.Oscilloscope}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Oscilloscope;

