import React, { useState, useEffect } from "react";
import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useAudioContextProvider } from "../circuits/AudioContextCircuit/AudioContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";

const FXDepthKnob = () => {
  //max:1, min:0でトレモロの深さを指定する変数
  const [depth, setDepth] = useState(0.5);
  const { audioContext, tremolo } = useAudioContextProvider();

  useEffect(() => {
    if (audioContext && tremolo) {
      tremolo.depth.gain.linearRampToValueAtTime(depth, audioContext.currentTime + 1);
    }
  }, [depth, tremolo?.depth]);

  const handleDepthChange = (depth: number) => {
    if (tremolo) {
      setDepth(depth);
    }
  };

  return (
    <div className={styles.knob}>
      <Label>Depth</Label>
      <Knob handleValueChange={handleDepthChange} defaultValue={0.5} />
      <Display parameter={depth}></Display>
    </div>
  );
};

export default FXDepthKnob;
