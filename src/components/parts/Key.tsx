import type { Tone } from "@/modules/AudioEngine/types";
import "@styles/Key.scss";
import React from "react";

interface Props {
  className?: string;
  keyColor: "black" | "white";
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  tone: Tone;
  hover?: boolean;
}
const Key = React.forwardRef<SVGGElement, Props>(
  ({ className, keyColor, x, y, width, height, tone, hover = false }: Props, ref) => {
    const WHITE_WIDTH = width;
    const WHITE_HEIGHT = height;
    const BLACK_WIDTH = (WHITE_WIDTH * 3) / 4;
    const BLACK_HEIGHT = WHITE_HEIGHT / 2;
    //フォントサイズは鍵の横幅に合わせる
    const WHITE_FONT_SIZE = WHITE_WIDTH;
    // クラス名が渡されてなかったら空文字にする
    className = className ? `${className} ` : "";

    const transform = `translate(${x}, ${y})`;

    return (
      <g ref={ref} className={`key${hover ? "hover" : ""}`} transform={transform}>
        <rect
          className={className + keyColor}
          width={keyColor === "white" ? WHITE_WIDTH : BLACK_WIDTH}
          height={keyColor === "white" ? WHITE_HEIGHT : BLACK_HEIGHT}
        ></rect>
        {keyColor === "white" ? ( //白鍵にだけ音階名を付記
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
  },
);

export default Key;
