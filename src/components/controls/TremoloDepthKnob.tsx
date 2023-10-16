import React, { useState, useEffect } from "react";
import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useAudioContextProvider } from "../circuits/AudioContextCircuit/AudioContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";

const FXDepthKnob = () => {
  //max:1, min:0でトレモロの深さを指定する変数
  const [value, setValue] = useState(0.5);
  const { audioContext, depth } = useAudioContextProvider();

  useEffect(() => {
    if (audioContext && depth) {
      depth.gain.linearRampToValueAtTime(value, audioContext.currentTime + 1);
    }
  }, [value]);

  const handleValueChange = (value: number) => {
    if (depth) {
      setValue(value);
    }
  };

  return (
    <div className={styles.knob}>
      <Label>Depth</Label>
      <Knob handleValueChange={handleValueChange} defaultValue={0.5} />
      <Display parameter={value}></Display>
    </div>
  );
};

export default FXDepthKnob;
