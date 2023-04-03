import React from "react";
import "@styles/Label.scss";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Label = ({ className, children }: Props) => {
  return <label className={className + " label"}>{children}</label>;
};

export default Label;
