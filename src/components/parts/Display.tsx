import React from "react";
import "@styles/Display.scss";

interface Props {
  parameter: number;
}

const Display = ({ parameter }: Props) => {
  return <p className="parameter-display">{parameter}</p>;
};

export default Display;
