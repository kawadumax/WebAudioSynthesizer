import React, { useState, useRef, useEffect } from "react";
import "@styles/Knob.scss";

interface Position {
  x: number;
  y: number;
}

interface Props {
  handleValueChange: (newGain: number) => void;
}

const Knob = ({ handleValueChange }: Props) => {
  const knobCenterPos = { x: 50, y: 50 };

  const [angle, setAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [currentPos, setCurrentPos] = useState<Position>({ x: 0, y: 0 });

  const knobRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isDragging) {
      const newAngle = getAngle(currentPos);
      setAngle(newAngle);
    }
  }, [isDragging, angle, currentPos]);

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
    setCurrentPos({ x: clientX, y: clientY });
  };

  const getAngle = (currentPos: Position) => {
    let angle = 0;
    if (knobRef.current?.getBoundingClientRect) {
      const svgPos = knobRef.current?.getBoundingClientRect();
      const dx = currentPos.x - (svgPos.x + knobCenterPos.x);
      const dy = currentPos.y - (svgPos.y + knobCenterPos.y);
      // 初期角度が真下なので、-90する。rotateにはdegreeを渡すのでラジアンから変換する。
      angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    }
    return angle;
  };
  // degree指定
  const transform = `rotate(${angle}, ${knobCenterPos.x}, ${knobCenterPos.y})`;

  return (
    <svg
      ref={knobRef}
      className="knob"
      width="100"
      height="100"
      viewBox="0 0 100 100"
      onMouseDown={handleMouseDown}
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
