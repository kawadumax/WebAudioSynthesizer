import React, { useState, useRef, useEffect } from "react";
import "@styles/Knob.scss";

interface Position {
  x: number;
  y: number;
}

interface Props {
  handleValueChange: (value: number) => void;
  defaultValue?: number;
  maxValue?: number;
  minValue?: number;
}

const Knob = ({
  handleValueChange,
  defaultValue = 0.5,
  maxValue = 1,
  minValue = 0,
}: Props) => {
  const knobCenterPos = { x: 50, y: 50 };

  const [angle, setAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [currentPos, setCurrentPos] = useState<Position>({ x: 0, y: 0 });

  const knobRef = useRef<SVGSVGElement>(null);

  const minAngle = -120;
  const maxAngle = 120;

  useEffect(() => {
    if (isDragging) {
      const oldAngle = angle;
      const newAngle = getAngle(currentPos);
      setAngle(newAngle);
      const newValue = getValue();
      handleValueChange(newValue);
    }
  }, [isDragging, angle, currentPos]);

  // 移動のイベントはdocumentから取ることでSVGの領域を超えてノブを動かせる
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
      // rotateにはdegreeを渡すのでラジアンから変換する。
      // atan2は(dy,dx)と渡すのが普通だけど、回転の開始角を下から始めるため
      // dyとdxを入れ替えて、かつ上下を入れ替えて渡している。
      angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    }
    // angleは-120 - 120の範囲とし、それを超える場合は上限値、下限値とする。
    angle = angle >= maxAngle ? maxAngle : angle;
    angle = angle <= minAngle ? minAngle : angle;
    return angle;
  };

  const getValue = () => {
    // 角度に応じてValueを返す。
    // 現在のAngleの重みを計算
    const rateAngle = (angle - minAngle) / (maxAngle - minAngle);
    //重みを元に現在のvalueを計算
    const value = (maxValue - minValue) * rateAngle + minValue;
    return value;
  };

  // degree指定
  const transform = `rotate(${angle}, ${knobCenterPos.x}, ${knobCenterPos.y})`;
  const width = 100;
  const height = 100;
  const knobRadius = 40;
  const thumWidth = 6;
  return (
    <svg
      ref={knobRef}
      className="knob"
      width={width}
      height={height}
      viewBox={"0 0 " + width + " " + height}
      onMouseDown={handleMouseDown}
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
