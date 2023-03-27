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
  const knobCenterPos = { x: 50, y: 50 };

  const [angle, setAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState<Position>({ x: 0, y: 0 });

  const knobRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isDragging) {
      const newAngle = getAngle(currentPos);
      setAngle(newAngle);
    }
  }, [isDragging, angle, startPos, currentPos]);

  // 移動のイベントはdocumentから取ることでSVGの範囲を超えてノブを動かせる
  useEffect(() => {
    const handleDocumentMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        setCurrentPos({
          x: event.clientX,
          y: event.clientY,
        });
      }
    };
    if (isDragging) {
      document.addEventListener("mousemove", handleDocumentMouseMove);
    }
    return () => {
      document.removeEventListener("mousemove", handleDocumentMouseMove);
    };
  }, [isDragging, setCurrentPos]);

  useEffect(() => {
    const handleMoveEnd = (event: MouseEvent) => {
      setIsDragging(false);
    };
    document.addEventListener("mouseup", handleMoveEnd);

    return () => {
      document.removeEventListener("mouseup", handleMoveEnd);
    };
  }, []);

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    const { clientX, clientY } = event;
    setStartPos({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
  };

  const handleTouchStart = (event: React.TouchEvent<SVGSVGElement>) => {
    setIsDragging(true);
    const { clientX, clientY } = event.targetTouches[0];
    setStartPos({ x: clientX, y: clientY });
    setCurrentPos({ x: clientX, y: clientY });
    console.log("touch start");
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

  const getAngle = (currentPos: Position) => {
    let angle = 0;
    if (knobRef.current?.getBoundingClientRect) {
      const svgPos = knobRef.current?.getBoundingClientRect();
      const dx = currentPos.x - (svgPos.x + knobCenterPos.x);
      const dy = currentPos.y - (svgPos.y + knobCenterPos.y);
      angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    }
    return angle;
  };
  // degree指定
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
    >
      <circle
        cx={knobCenterPos.x}
        cy={knobCenterPos.y}
        r="40"
        fill="white"
        stroke="white"
      />
      {/* rectは左上がアンカーポイントになる。 初期配置アングルは下。太めのlineで、極座標でやったら影は回転せずに済むかも。*/}
      <rect x="47" y="50" width="6px" height="42px" transform={transform} />
    </svg>
  );
};

export default Knob;
