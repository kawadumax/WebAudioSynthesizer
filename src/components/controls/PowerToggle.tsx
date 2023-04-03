import React, { useState, useEffect, Component } from "react";
import Led from "@components/parts/Led";
import Toggle from "@components/parts/Toggle";
import "@styles/PowerToggle.scss";

const PowerToggle = () => {
  const [power, setPower] = useState(false);
  const handlePower = () => {
    setPower(!power);
  };
  return (
    <div className="power-toggle">
      <label>Power</label>
      <Toggle onToggle={handlePower}></Toggle>
      <Led className="power-toggle-led" isActive={power}></Led>
    </div>
  );
};

export default PowerToggle;
