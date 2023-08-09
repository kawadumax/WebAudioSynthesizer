import React, { useState, useEffect } from "react";
import Knob from "@components/parts/Knob";
import Display from "@components/parts/Display";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit/AudioContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";

const FXFrequencyKnob = () => {
  //max:20, min:0.1でトレモロの周波数
  const [frequency, setFrequency] = useState(0.5);
  const { gainNode, audioContext } = useAudioContextCircuit();

  // useEffect(() => {
  //   if (gainNode) {
  //     gainNode.gain.value = frequency;
  //   }
  // }, [frequency, gainNode]);

  const handleLFOChange = (freq: number) => {
    if (gainNode) {
      setFrequency(freq);
    }
  };

  return (
    <div className={styles.knob}>
      <Label>Frequency</Label>
      <Knob handleValueChange={handleLFOChange} defaultValue={0.5} />
      <Display parameter={frequency}></Display>
    </div>
  );
};

export default FXFrequencyKnob;
