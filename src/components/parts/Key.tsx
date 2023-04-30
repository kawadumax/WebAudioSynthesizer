import React from "react";
import "@styles/Key.scss";

interface Props {
  className?: string;
  keyColor: "black" | "white";
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  toneName?: string;
  toneFreq?: number;
  onKeyClick?: (keyOrFreq: string | number, freq?: number) => void;
}

const Key = ({
  className,
  keyColor,
  x,
  y,
  width,
  height,
  toneName,
  toneFreq,
  onKeyClick,
}: Props) => {
  const WHITE_WIDTH = width;
  const WHITE_HEIGHT = height;
  const BLACK_WIDTH = (WHITE_WIDTH * 3) / 4;
  const BLACK_HEIGHT = WHITE_HEIGHT / 2;
  //フォントサイズは鍵の横幅に合わせる
  const WHITE_FONT_SIZE = WHITE_WIDTH;

  const transform = `translate(${x}, ${y})`;

  const handleClick = (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
    if (onKeyClick) {
      if (toneName && toneFreq) onKeyClick(toneName, toneFreq);
    }
  };

  return (
    <g className="key" transform={transform} onClick={handleClick}>
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
          <tspan textAnchor="middle" dominantBaseline="central">
            {toneName ? toneName[0] : null}
          </tspan>
          <tspan dx="-10" textAnchor="middle" dominantBaseline="central">
            {toneName ? toneName[1] : null}
          </tspan>
        </text>
      ) : null}
    </g>
  );
};

export default Key;
