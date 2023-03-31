import React from "react";
import "@styles/Display.scss";

interface Props {
  parameter: number;
}

const Display = ({ parameter }: Props) => {
  return <p className="parameter-display">{parameter.toFixed(2)}</p>;
};

export default Display;
