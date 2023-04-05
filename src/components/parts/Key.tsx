import React from "react";
import "@styles/Key.scss";

interface Props {
  className?: string;
  color: "black" | "white";
  x: number;
  y: number;
}

const Key = ({ className, color, x, y }: Props) => {
  const WHITE_WIDTH = 20;
  const WHITE_HEIGHT = 100;
  const BLACK_WIDTH = WHITE_WIDTH - 6;
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
    />
  );
};

export default Key;
