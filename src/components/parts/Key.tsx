import React from "react";
import { Tone } from "../circuits/TypeCircuit";
import "@styles/Key.scss";

interface Props {
  className?: string;
  keyColor: "black" | "white";
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  tone: Tone;
  onKeyPressed?: (tone: Tone) => void;
  onKeyReleased?: (tone: Tone) => void;
}

const Key = ({
  className,
  keyColor,
  x,
  y,
  width,
  height,
  tone,
  onKeyPressed,
  onKeyReleased,
}: Props) => {
  const WHITE_WIDTH = width;
  const WHITE_HEIGHT = height;
  const BLACK_WIDTH = (WHITE_WIDTH * 3) / 4;
  const BLACK_HEIGHT = WHITE_HEIGHT / 2;
  //フォントサイズは鍵の横幅に合わせる
  const WHITE_FONT_SIZE = WHITE_WIDTH;

  const transform = `translate(${x}, ${y})`;

  const handleMouseDown = (
    event: React.MouseEvent<SVGGElement, MouseEvent>
  ) => {
    if (onKeyPressed) onKeyPressed(tone);
  };

  const handleMouseUp = (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
    if (onKeyReleased) onKeyReleased(tone);
  };

  const handleTouchStart = (event: React.TouchEvent<SVGGElement>) => {
    if (onKeyPressed) onKeyPressed(tone);
  };

  const handleTouchEnd = (event: React.TouchEvent<SVGGElement>) => {
    if (onKeyReleased) onKeyReleased(tone);
  };

  return (
    <g
      className="key"
      transform={transform}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseUp={handleMouseUp}
    >
      <rect
        className={className + " " + keyColor}
        width={keyColor === "white" ? WHITE_WIDTH : BLACK_WIDTH}
        height={keyColor === "white" ? WHITE_HEIGHT : BLACK_HEIGHT}
      ></rect>
      {keyColor === "white" ? (
        <text
          x={WHITE_WIDTH / 2}
          y={WHITE_HEIGHT - WHITE_FONT_SIZE}
          fontSize={WHITE_FONT_SIZE}
          fontFamily="Share Tech Mono, monospace"
          fontWeight="thin"
        >
          <tspan textAnchor="middle" dominantBaseline="hanging">
            {tone.name ? tone.name[0] : null}
          </tspan>
          <tspan dx="-10" textAnchor="middle" dominantBaseline="hanging">
            {tone.name ? tone.name[1] : null}
          </tspan>
        </text>
      ) : null}
    </g>
  );
};

export default Key;
