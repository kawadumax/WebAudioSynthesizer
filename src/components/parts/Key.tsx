import React from "react";
import "@styles/Key.scss";

interface Props {
  className?: string;
  keyColor: "black" | "white";
  x: number;
  y: number;
  width: number;
  height: number;
  // label?: string;
  index: number;
  toneName?: string;
  toneFreq?: number;
  onKeyClick?: (key: number) => void;
}

const Key = ({
  className,
  keyColor,
  x,
  y,
  width,
  height,
  index,
  toneName,
  toneFreq,
  onKeyClick,
}: Props) => {
  const labels = ["F", "G", "A", "B", "C", "D", "E"];
  const label = labels[index % 7];
  const WHITE_WIDTH = width;
  const WHITE_HEIGHT = height;
  const BLACK_WIDTH = (WHITE_WIDTH * 3) / 4;
  const BLACK_HEIGHT = WHITE_HEIGHT / 2;
  //フォントサイズは鍵の横幅に合わせる
  const WHITE_FONT_SIZE = WHITE_WIDTH;
  const tone = 60;

  const transform = `translate(${x}, ${y})`;

  const handleClick = (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
    if (onKeyClick) {
      onKeyClick(tone);
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
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Share Tech Mono, monospace"
          fontWeight="thin"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

export default Key;
