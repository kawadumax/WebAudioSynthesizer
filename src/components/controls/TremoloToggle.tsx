import React, { useState, useEffect, Component } from "react";
import Led from "@parts/Led";
import Toggle from "@parts/Toggle";
import Label from "@parts/Label";
import styles from "@styles/TremoloToggle.module.scss";

interface Props {
  // onPower: (isToggled: boolean) => void;
}

const TremoloToggle = ({ }: Props) => {

  return (
    <div className={styles.TremoloToggle}>
      <Label>Tremolo</Label>

      <Led className="fx-toggle-led" isActive={true}></Led>
      <Toggle></Toggle>
    </div>
  );
};

export default TremoloToggle;
