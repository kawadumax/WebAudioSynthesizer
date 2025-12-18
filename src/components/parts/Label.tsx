import style from "@styles/parts/Label.module.scss";
import type React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Label = ({ className, children }: Props) => {
  const classes = [className, style.label].filter(Boolean).join(" ");
  return <label className={classes}>{children}</label>;
};

export default Label;
