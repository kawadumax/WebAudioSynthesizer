import React, { useState, useEffect, Component } from "react";
import Led from "@parts/Led";
import Toggle from "@parts/Toggle";
import Label from "@parts/Label";
import style from "@styles/controls/PowerToggle.module.scss";
import { useApplicationContext } from "../circuits/AudioCircuit/ApplicationContextProvider";

const PowerToggle = () => {
  const { audioContext } = useApplicationContext();
  const [power, setPower] = useState(false);
  const handlePower = () => {
    setPower(!power);
  };

  useEffect(() => {
    if (power) {
      audioContext.resume();
    } else {
      audioContext.suspend();
    }
  }, [power]);

  return (
    <div className={style["power-toggle"]}>
      <Label>Power</Label>
      <Led className={style["power-toggle-led"]} isActive={power}></Led>
      <Toggle onToggle={handlePower}></Toggle>

    </div>
  );
};

export default PowerToggle;
