import React, { useState, useRef, useEffect } from "react";
import "@styles/Knob.scss";

interface Position {
  x: number;
  y: number;
}

interface Props {
  // audioParam: AudioParam;
  handleValueChange: (newGain: number) => void;
}

const Knob = ({ handleValueChange }: Props) => {
  const [angle, setAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState<Position>({ x: 0, y: 0 });

  const knobRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isDragging) {
      const angleDiff = getAngleDiff(startPos, currentPos);
      const newAngle = angle + angleDiff;
      setAngle(newAngle);
      setStartPos(currentPos);
    }
  }, [isDragging, angle, startPos, currentPos]);

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    const { clientX, clientY } = event;
    setStartPos({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
  };

  const handleTouchStart = (event: React.TouchEvent<SVGSVGElement>) => {
    setIsDragging(true);
    const { clientX, clientY } = event.touches[0];
    setStartPos({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
  };

  const handleStart = (
    event: React.TouchEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>
  ) => {
    event.preventDefault();
    // タッチパッドの場合
    if (event.type === "touchstart") {
      // タッチの座標を取得して処理
      handleTouchStart(event as React.TouchEvent<SVGSVGElement>);
    } else if (event.type === "mousedown") {
      // マウスの座標を取得して処理
      handleMouseDown(event as React.MouseEvent<SVGSVGElement>);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      const { clientX, clientY } = event;
      setCurrentPos({ x: clientX, y: clientY });
    }
  };

  const handleTouchMove = (event: React.TouchEvent<SVGSVGElement>) => {
    if (isDragging) {
      const { clientX, clientY } = event.touches[0];
      setCurrentPos({ x: clientX, y: clientY });
    }
  };

  const handleMove = (
    event: React.TouchEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>
  ) => {
    event.preventDefault();
    // タッチパッドの場合
    if (event.type === "touchmove") {
      // タッチの座標を取得して処理
      handleTouchMove(event as React.TouchEvent<SVGSVGElement>);
    } else if (event.type === "mousemove") {
      // マウスの座標を取得して処理
      handleMouseMove(event as React.MouseEvent<SVGSVGElement>);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleEnd = (
    event: React.TouchEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>
  ) => {
    event.preventDefault();
    // タッチパッドの場合
    if (event.type === "touchend") {
      // タッチの座標を取得して処理
      handleMouseUp();
    } else if (event.type === "mouseup") {
      // マウスの座標を取得して処理
      handleTouchEnd();
    }
  };

  const getAngleDiff = (startPos: Position, currentPos: Position) => {
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    const angle = Math.atan2(dy, dx);
    return angle * (3 / Math.PI);
  };

  const transform = `rotate(${angle}, 50, 50)`;

  return (
    <svg
      ref={knobRef}
      className="knob"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onMouseUp={handleEnd}
      onTouchEnd={handleEnd}
    >
      <circle cx="50" cy="50" r="40" fill="white" stroke="white" />
      {/* rextは左上がアンカーポイントになる。 初期配置アングルは下。太めのlineで、極座標でやったら影は回転せずに済むかも。*/}
      <rect x="47" y="50" width="6px" height="42px" transform={transform} />
    </svg>
  );
};

export default Knob;
