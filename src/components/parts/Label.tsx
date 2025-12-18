import style from "@styles/parts/Label.module.scss";
import type React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Label = ({ className, children }: Props) => {
  return <label className={`${className}  ${style.label}`}>{children}</label>;
};

export default Label;
