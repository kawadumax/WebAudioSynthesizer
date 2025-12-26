import style from "@styles/parts/Toggle.module.scss";
import { useEffect, useRef, useState } from "react";

interface ToggleProps {
  isOn?: boolean;
  onToggle?: (isChecked: boolean) => void;
}

const Toggle = ({ isOn, onToggle }: ToggleProps) => {
  const [internalOn, setInternalOn] = useState(false);
  const isChecked = isOn ?? internalOn;
  const animateRef = useRef<SVGAnimateElement>(null);
  const previousXRef = useRef<number | null>(null);

  const handleClick = () => {
    const next = !isChecked;
    if (isOn === undefined) {
      setInternalOn(next);
    }
    if (onToggle) {
      onToggle(next);
    }
  };

  const height = 40;
  const width = 100;
  const radius = height / 4;
  const offX = width / 3;
  const onX = (2 * width) / 3;

  useEffect(() => {
    const animate = animateRef.current;
    if (!animate) return;

    const toX = isChecked ? onX : offX;
    const fromX = previousXRef.current ?? toX;

    if (fromX !== toX) {
      animate.setAttribute("from", String(fromX));
      animate.setAttribute("to", String(toX));
      animate.beginElement();
    }
    previousXRef.current = toX;
  }, [isChecked, offX, onX]);

  return (
    <button
      type="button"
      className={style.toggleButton}
      aria-pressed={isChecked}
      aria-label="Toggle switch"
      onClick={handleClick}
    >
      <svg className={style.toggle} width={width} height={height} role="img" aria-hidden="true">
        <title>Toggle switch</title>
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
        <circle cx={isChecked ? onX : offX} cy={height / 2} r={radius} fill="white">
          <animate
            ref={animateRef}
            attributeName="cx"
            dur="0.1s"
            fill="freeze"
            id="move"
          />
        </circle>
      </svg>
    </button>
  );
};

export default Toggle;
