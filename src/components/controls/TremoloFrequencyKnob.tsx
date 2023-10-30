import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useApplicationContext } from "../circuits/AudioCircuit/ApplicationContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";
import { useState, useEffect } from "react";

const TremoloFrequencyKnob = () => {
  //max:20, min:0でトレモロのlfoを指定する変数
  const MAX_VALUE = 20;
  const MIN_VALUE = 0;
  const DEFAULT_VALUE = 1;
  const [frequency, setFrequency] = useState(DEFAULT_VALUE);
  const { audioContext, lfo } = useApplicationContext();

  useEffect(() => {
    if (audioContext && lfo) {
      lfo.frequency.linearRampToValueAtTime(
        frequency,
        audioContext.currentTime + 1
      );
    }
  }, [frequency]);

  const handleLFOChange = (frequency: number) => {
    if (frequency) {
      setFrequency(frequency);
    }
  };

  return (
    <div className={styles.knob}>
      <Label>LFO</Label>
      <Knob
        onChange={handleLFOChange}
        defaultValue={DEFAULT_VALUE}
        maxValue={MAX_VALUE}
        minValue={MIN_VALUE}
      />
      <Display parameter={frequency}></Display>
    </div>
  );
};

export default TremoloFrequencyKnob;
