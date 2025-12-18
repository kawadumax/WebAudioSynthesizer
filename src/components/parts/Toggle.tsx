import style from "@styles/parts/Toggle.module.scss";
import React, { useEffect, useRef } from "react";

interface ToggleProps {
  onToggle?: (isChecked: boolean) => void;
}

const Toggle = ({ onToggle }: ToggleProps) => {
  const [isChecked, setIsChecked] = React.useState(true);
  const animateRef = useRef<SVGAnimateElement>(null);

  useEffect(() => {
    if (animateRef.current) {
      animateRef.current.beginElement();
    }
  }, []);

  const handleClick = () => {
    setIsChecked(!isChecked);
    if (onToggle) {
      onToggle(!isChecked);
    }
  };

  const height = 40;
  const width = 100;
  const radius = height / 4;
  const initialX = width / 3;
  const movedX = (2 * width) / 3;
  return (
    <svg className={style.toggle} width={width} height={height} onClick={handleClick}>
      <rect
        className="groove"
        x={width / 3 - radius}
        y={height / 4}
        width={width / 3 + radius * 2}
        height={height / 2}
        rx={radius}
        fill="white"
        filter="url(#drop-shadow-groove)"
      />
      <filter x="-20%" y="-20%" width="140%" height="140%" id="drop-shadow-groove">
        <feOffset dx="0" dy="0" />
        <feGaussianBlur stdDeviation="2" result="offset-blur" />
        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
        <feFlood floodColor="#000" floodOpacity="0.5" result="color" />
        <feComposite operator="in" in="color" in2="inverse" result="shadow" />
        <feComposite operator="over" in="shadow" in2="SourceGraphic" />
      </filter>
      <circle cx={initialX} cy={height / 2} r={radius} fill="white">
        <animate
          ref={animateRef}
          attributeName="cx"
          from={isChecked ? movedX : initialX}
          to={isChecked ? initialX : movedX}
          dur="0.1s"
          fill="freeze"
          id="move"
        />
      </circle>
    </svg>
  );
};

export default Toggle;
