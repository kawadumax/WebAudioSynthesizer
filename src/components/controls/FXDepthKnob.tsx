import React, { useState, useEffect } from "react";
import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit/AudioContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";

const FXDepthKnob = () => {
  //max:1, min:0でトレモロの深さを指定する変数
  const [depth, setDepth] = useState(0.5);
  // const { gainNode } = useAudioContextCircuit();

  // useEffect(() => {
  //   if (gainNode) {
  //     gainNode.gain.value = frequency;
  //   }
  // }, [frequency, gainNode]);

  const handleLFOChange = (freq: number) => {
    // if (gainNode) {
    //   setFrequency(freq);
    // }
  };

  return (
    <div className={styles.knob}>
      <Label>Depth</Label>
      <Knob handleValueChange={handleLFOChange} defaultValue={0.5} />
      <Display parameter={depth}></Display>
    </div>
  );
};

export default FXDepthKnob;
