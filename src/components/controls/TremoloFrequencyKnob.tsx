import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useAudioContextProvider } from "../circuits/AudioContextCircuit/AudioContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";
import { useState, useEffect } from "react";

const TremoloFrequencyKnob = () => {

  //max:20, min:0でトレモロのlfoを指定する変数
  const MAX_VALUE = 20;
  const MIN_VALUE = 0;
  const DEFAULT_VALUE = 0.5
  const [frequency, setFrequency] = useState(DEFAULT_VALUE);
  const { audioContext, tremolo } = useAudioContextProvider();

  useEffect(() => {
    if (audioContext && tremolo) {
      tremolo.lfo.frequency.linearRampToValueAtTime(frequency, audioContext.currentTime + 1);
    }
  }, [frequency, tremolo?.lfo]);

  const handleLFOChange = (frequency: number) => {
    if (tremolo) {
      setFrequency(frequency);
    }
  };

  return (
    <div className={styles.knob}>
      <Label>LFO</Label>
      <Knob handleValueChange={handleLFOChange} defaultValue={DEFAULT_VALUE} maxValue={MAX_VALUE} minValue={MIN_VALUE} />
      <Display parameter={frequency}></Display>
    </div>
  );
};

export default TremoloFrequencyKnob;
