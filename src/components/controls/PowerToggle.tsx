import React, { useState, useEffect, Component } from "react";
import Led from "@components/parts/Led";
import Toggle from "@components/parts/Toggle";
import Label from "@components/parts/Label";
import "@styles/PowerToggle.scss";

interface Props {
  onPower: (isToggled: boolean) => void;
}

const PowerToggle = ({ onPower }: Props) => {
  const [power, setPower] = useState(false);
  const handlePower = () => {
    setPower(!power);
  };

  useEffect(() => {
    onPower(power);
  }, [power]);

  return (
    <div className="power-toggle">
      <Label>Power</Label>
      <Toggle onToggle={handlePower}></Toggle>
      <Led className="power-toggle-led" isActive={power}></Led>
    </div>
  );
};

export default PowerToggle;
