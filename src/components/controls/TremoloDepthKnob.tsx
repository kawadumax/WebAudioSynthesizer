import Display from "@parts/Display";
import Knob from "@parts/Knob";
import styles from "@styles/controls/KnobControl.module.scss";
import { useEffect, useState } from "react";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import Label from "../parts/Label";

const FXDepthKnob = () => {
  //max:1, min:0でトレモロの深さを指定する変数
  const [value, setValue] = useState(0.5);
  const { engine } = useAudioEngine();

  useEffect(() => {
    engine.setTremoloDepth(value);
  }, [engine, value]);

  const handleValueChange = (value: number) => {
    setValue(value);
  };

  return (
    <div className={styles.KnobControl}>
      <Label>Depth</Label>
      <Knob onChange={handleValueChange} defaultValue={0.5} />
      <Display parameter={value}></Display>
    </div>
  );
};

export default FXDepthKnob;

