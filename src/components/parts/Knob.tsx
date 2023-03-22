import React, { useState, useRef, useEffect } from "react";
import "@styles/Knob.scss";

interface Position {
  x: number;
  y: number;
}

const Knob = () => {
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

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      const { clientX, clientY } = event;
      setCurrentPos({ x: clientX, y: clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <circle cx="50" cy="50" r="40" fill="white" stroke="white" />
      <rect x="47" y="50" width="6px" height="42px" transform={transform} />
    </svg>
  );
};

export default Knob;
