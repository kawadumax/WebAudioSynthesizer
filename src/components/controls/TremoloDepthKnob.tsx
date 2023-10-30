import React, { useState, useEffect } from "react";
import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useApplicationContext } from "../circuits/AudioContextCircuit/ApplicationContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";

const FXDepthKnob = () => {
  //max:1, min:0でトレモロの深さを指定する変数
  const [value, setValue] = useState(0.5);
  const { audioContext, depth } = useApplicationContext();

  useEffect(() => {
    if (audioContext && depth) {
      depth.gain.linearRampToValueAtTime(value, audioContext.currentTime + 1);
    }
  }, [value]);

  const handleValueChange = (value: number) => {
    setValue(value);
  };

  return (
    <div className={styles.knob}>
      <Label>Depth</Label>
      <Knob onChange={handleValueChange} defaultValue={0.5} />
      <Display parameter={value}></Display>
    </div>
  );
};

export default FXDepthKnob;
