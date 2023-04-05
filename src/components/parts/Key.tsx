import React from "react";
import "@styles/Key.scss";

interface Props {
  className?: string;
  color: "black" | "white";
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

const Key = ({ className, color, x, y, width, height, label = "C" }: Props) => {
  const WHITE_WIDTH = width;
  const WHITE_HEIGHT = height;
  const BLACK_WIDTH = (WHITE_WIDTH * 3) / 4;
  const BLACK_HEIGHT = WHITE_HEIGHT / 2;
  //フォントサイズは鍵の横幅に合わせる
  const WHITE_FONT_SIZE = WHITE_WIDTH;
  const BLACK_FONT_SIZE = BLACK_WIDTH;
  return (
    <rect
      className={className + " key " + color}
      width={color == "white" ? WHITE_WIDTH : BLACK_WIDTH}
      height={color == "white" ? WHITE_HEIGHT : BLACK_HEIGHT}
      x={x}
      y={y}
    >
      <text>{label}</text>
    </rect>
  );
};

export default Key;
