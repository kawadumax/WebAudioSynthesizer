import Display from "@parts/Display";
import Knob from "@parts/Knob";
import styles from "@styles/controls/KnobControl.module.scss";
import { useEffect, useState } from "react";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import Label from "../parts/Label";

const TremoloFrequencyKnob = () => {
  //max:20, min:0でトレモロのlfoを指定する変数
  const MAX_VALUE = 20;
  const MIN_VALUE = 0;
  const DEFAULT_VALUE = 1;
  const [frequency, setFrequency] = useState(DEFAULT_VALUE);
  const { engine } = useAudioEngine();

  useEffect(() => {
    engine.setTremoloFrequency(frequency);
  }, [engine, frequency]);

  const handleLFOChange = (frequency: number) => {
    setFrequency(frequency);
  };

  return (
    <div className={styles.KnobControl}>
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

