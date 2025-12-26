import Display from "@parts/Display";
import Knob from "@parts/Knob";
import Label from "@parts/Label";
import styles from "@styles/controls/KnobControl.module.scss";
import { useEffect, useState } from "react";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";

const MasterVolumeKnob = () => {
  const [gain, setGain] = useState(0.5);
  const { engine } = useAudioEngine();

  useEffect(() => {
    engine.setMasterGain(gain);
  }, [engine, gain]);

  const handleGainChange = (newGain: number) => {
    setGain(newGain);
  };

  return (
    <div className={styles.KnobControl}>
      <Label>Master</Label>
      <Knob onChange={handleGainChange} defaultValue={0.5} />
      <Display parameter={gain}></Display>
    </div>
  );
};

export default MasterVolumeKnob;

