import React, { useState, useEffect } from "react";
import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useAudioContextProvider } from "../circuits/AudioContextCircuit/AudioContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";

const GainKnob = () => {
  const [gain, setGain] = useState(0.5);
  const { gainNode } = useAudioContextProvider();

  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = gain;
    }
  }, [gain, gainNode]);

  const handleGainChange = (newGain: number) => {
    if (gainNode) {
      setGain(newGain);
    }
  };

  return (
    <div className={styles.knob}>
      <Label>Gain</Label>
      <Knob handleValueChange={handleGainChange} defaultValue={0.5} />
      <Display parameter={gain}></Display>
    </div>
  );
};

export default GainKnob;
