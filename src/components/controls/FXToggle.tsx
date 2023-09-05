import React, { useState, useEffect, Component } from "react";
import Led from "@parts/Led";
import Toggle from "@parts/Toggle";
import Label from "@parts/Label";
import styles from "@styles/FXToggle.module.scss";

interface Props {
  // onPower: (isToggled: boolean) => void;
}

const FXToggle = ({}: Props) => {
  // const [power, setPower] = useState(false);
  // const handlePower = () => {
  //   setPower(!power);
  // };

  // useEffect(() => {
  //   onPower(power);
  // }, [power]);

  return (
    <div className={styles.FXToggle}>
      <Label>Tremolo</Label>

      <Led className="fx-toggle-led" isActive={true}></Led>
      <Toggle></Toggle>
    </div>
  );
};

export default FXToggle;
