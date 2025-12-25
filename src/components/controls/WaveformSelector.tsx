// 他のコンポーネントまたはページで

import SelectBox from "@components/parts/SelectBox";
import styles from "@styles/controls/WaveformSelector.module.scss";
import type React from "react";
import { useEffect, useState } from "react";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import type { Waveform } from "@/modules/AudioEngine/types";
import Label from "../parts/Label";

const options: Waveform[] = ["sine", "square", "sawtooth", "triangle"];

const WaveFormSelector: React.FC = () => {
  const { engine } = useAudioEngine();
  const [value, setValue] = useState(options[0]);
  const changeHandler = (option: Waveform) => {
    setValue(option);
  };

  useEffect(() => {
    engine.setWaveform(value);
  }, [engine, value]);

  return (
    <div className={styles.WaveformSelector}>
      <Label>{"Select Waveform"}</Label>
      <SelectBox options={options} onChange={changeHandler} initialValue={value} />
    </div>
  );
};

export default WaveFormSelector;

