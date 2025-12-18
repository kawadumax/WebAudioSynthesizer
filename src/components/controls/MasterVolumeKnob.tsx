import Display from "@parts/Display";
import Knob from "@parts/Knob";
import Label from "@parts/Label";
import styles from "@styles/controls/KnobControl.module.scss";
import { useEffect, useState } from "react";
import { useApplicationContext } from "../circuits/AudioCircuit/ApplicationContextProvider";

const MasterVolumeKnob = () => {
  const [gain, setGain] = useState(0.5);
  const { masterVolume } = useApplicationContext();

  useEffect(() => {
    if (masterVolume) {
      masterVolume.gain.value = gain;
    }
  }, [gain, masterVolume]);

  const handleGainChange = (newGain: number) => {
    if (masterVolume) {
      setGain(newGain);
    }
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
