import React, { useState, useEffect, Component } from "react";
import Led from "@components/parts/Led";
import Toggle from "@components/parts/Toggle";
import Label from "@components/parts/Label";
import "@styles/PowerToggle.scss";

interface Props {
  // onPower: (isToggled: boolean) => void;
}

const PowerToggle = ({ }: Props) => {
  // const [power, setPower] = useState(false);
  // const handlePower = () => {
  //   setPower(!power);
  // };

  // useEffect(() => {
  //   onPower(power);
  // }, [power]);

  return (
    <div className="fx-toggle">
      <Label>Power</Label>
      <Toggle></Toggle>
      <Led className="fx-toggle-led" isActive={true}></Led>
    </div>
  );
};

export default PowerToggle;
