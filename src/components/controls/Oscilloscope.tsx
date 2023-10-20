import React, { useEffect, useRef } from "react";
import { useAudioContextProvider } from "../circuits/AudioContextCircuit/AudioContextProvider";
import "@styles/Oscilloscope.scss";

interface Props {
  className?: string;
}

const Oscilloscope = ({ className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioContext, analyser } = useAudioContextProvider();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;


    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateFrame = () => {
      requestAnimationFrame(updateFrame);
      analyser.getByteTimeDomainData(dataArray);

      canvasContext.fillStyle = "#ffffff";
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "#ff0000";
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
    };

    updateFrame();

    // コンポーネントがアンマウントされたらオーディオ解析ノードを解放する
    return () => {
    };
  }, [audioContext, canvasRef]);

  return (
    <div className={"oscilloscope " + className}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Oscilloscope;
