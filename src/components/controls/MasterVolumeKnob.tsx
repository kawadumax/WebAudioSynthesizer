import { useState, useEffect } from "react";
import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useApplicationContext } from "../circuits/AudioCircuit/ApplicationContextProvider";
import Label from "@parts/Label";
import styles from "@styles/Knob.module.scss";

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
    <div className={styles.knob}>
      <Label>Master</Label>
      <Knob onChange={handleGainChange} defaultValue={0.5} />
      <Display parameter={gain}></Display>
    </div>
  );
};

export default MasterVolumeKnob;
