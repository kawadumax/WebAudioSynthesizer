import React, { useState, useRef, useEffect } from "react";
import style from "@styles/parts/Knob.module.scss";

type CommonMouseEvent = React.MouseEvent | MouseEvent;
type CommonTouchEvent = React.TouchEvent | TouchEvent;

interface Position {
  x: number;
  y: number;
}

interface Props {
  onChange: (value: number) => void;
  defaultValue?: number;
  maxValue?: number;
  minValue?: number;
}

const Knob = ({
  onChange,
  defaultValue = 0.5,
  maxValue = 1,
  minValue = 0,
}: Props) => {
  const knobCenterPos = { x: 50, y: 50 };

  const [angle, setAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [currentPos, setCurrentPos] = useState<Position>({ x: 0, y: 0 });

  const knobRef = useRef<SVGSVGElement>(null);

  const MIN_ANGLE = -120;
  const MAX_ANGLE = 120;

  // degree指定
  const transform = `rotate(${angle}, ${knobCenterPos.x}, ${knobCenterPos.y})`;
  const width = 100;
  const height = 100;
  const knobRadius = 40;
  const thumWidth = 6;

  const isMouseEvent = (event: CommonMouseEvent | CommonTouchEvent): event is CommonMouseEvent => {
    return (event as CommonMouseEvent).clientX !== undefined;
  }

  const getClientCoordinates = (event: CommonMouseEvent | CommonTouchEvent): Position => {
    if (isMouseEvent(event)) {
      return { x: event.clientX, y: event.clientY };
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      return { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleMouseDownAndTouchStart = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setCurrentPos(getClientCoordinates(event));
  };

  const handleMouseMoveAndTouchMove = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    if (isDragging) {
      setCurrentPos(getClientCoordinates(event));
    }
  };

  const handleMouseUpAndTouchEnd = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const initAngle = () => {
    // defaut valueが何%に当たるかを計算する
    const rate = (defaultValue - minValue) / (maxValue - minValue);
    // その%がどれぐらいのangleに相当するか計算する
    const newAngle = MIN_ANGLE + rate * (MAX_ANGLE - MIN_ANGLE);
    setAngle(newAngle);
  }

  const getAngle = (currentPos: Position) => {
    let angle = 0;
    if (knobRef.current?.getBoundingClientRect) {
      const svgPos = knobRef.current?.getBoundingClientRect();
      const dx = currentPos.x - (svgPos.x + knobCenterPos.x);
      const dy = currentPos.y - (svgPos.y + knobCenterPos.y);
      // rotateにはdegreeを渡すのでラジアンから変換する。
      // atan2は(dy,dx)と渡すのが普通だけど、回転の開始角を下から始めるため
      // dyとdxを入れ替えて、かつ上下を入れ替えて渡している。
      angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    }
    // angleは-120 - 120の範囲とし、それを超える場合は上限値、下限値とする。
    angle = angle >= MAX_ANGLE ? MAX_ANGLE : angle;
    angle = angle <= MIN_ANGLE ? MIN_ANGLE : angle;
    return angle;
  };

  const getValue = (angle: number) => {
    // 角度に応じてValueを返す。
    // 現在のAngleの重みを計算
    const rateAngle = (angle - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE);
    //重みを元に現在のvalueを計算
    const value = (maxValue - minValue) * rateAngle + minValue;
    return value;
  };

  useEffect(() => {
    initAngle();
    const current = knobRef.current;
    current?.addEventListener("mousedown", handleMouseDownAndTouchStart, { passive: false });
    current?.addEventListener("touchstart", handleMouseDownAndTouchStart, { passive: false });
    return (() => {
      current?.removeEventListener("mousedown", handleMouseDownAndTouchStart);
      current?.removeEventListener("touchstart", handleMouseDownAndTouchStart);
    })
  }, []);

  useEffect(() => {
    if (isDragging) {
      const newAngle = getAngle(currentPos);
      setAngle(newAngle);
      const newValue = getValue(newAngle);
      onChange(newValue);
    }
  }, [isDragging, currentPos]);

  // 移動のイベントはdocumentから取ることでSVGの領域を超えてノブを動かせる
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMoveAndTouchMove, { passive: false });
      document.addEventListener("touchmove", handleMouseMoveAndTouchMove, { passive: false });
      document.addEventListener("mouseup", handleMouseUpAndTouchEnd, { passive: false });
      document.addEventListener("touchend", handleMouseUpAndTouchEnd, { passive: false });
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMoveAndTouchMove);
      document.removeEventListener("touchmove", handleMouseMoveAndTouchMove);
      document.removeEventListener("mouseup", handleMouseUpAndTouchEnd);
      document.removeEventListener("touchend", handleMouseUpAndTouchEnd);
    };
  }, [isDragging]);

  return (
    <svg
      ref={knobRef}
      className={style.Knob}
      viewBox={"0 0 " + width + " " + height}
    >
      <circle
        cx={knobCenterPos.x}
        cy={knobCenterPos.y}
        r={knobRadius}
        fill="white"
        stroke="white"
      />
      {/* rectは左上がアンカーポイントになる。 初期配置アングルは↑。太めのlineで、極座標でやったら影は回転せずに済むかも。*/}
      <rect
        x={width / 2 - thumWidth / 2}
        y={height / 2 - knobRadius}
        width={thumWidth}
        height={height / 2 - 8}
        transform={transform}
      />
    </svg>
  );
};

export default Knob;
