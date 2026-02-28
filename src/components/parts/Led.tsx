import type { CSSProperties } from "react";
import "@styles/Led.scss";

interface Props {
  className?: string;
  isActive: boolean;
  style?: CSSProperties;
}

const Led = ({ className, isActive, style }: Props) => {
  return <i className={`${className} ${isActive ? "led on" : "led off"}`} style={style}></i>;
};

export default Led;
