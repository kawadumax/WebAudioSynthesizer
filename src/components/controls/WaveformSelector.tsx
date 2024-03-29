// 他のコンポーネントまたはページで

import React, { useEffect, useState } from "react";
import SelectBox from "@components/parts/SelectBox";
import styles from "@styles/controls/WaveformSelector.module.scss";
import { useApplicationContext } from "@circuits/AudioCircuit/ApplicationContextProvider";
import { Waveform } from "@/modules/Type";
import Label from "../parts/Label";

const options: Waveform[] = ["sine", "square", "sawtooth", "triangle"];

const WaveFormSelector: React.FC = () => {
  const { setWaveform } = useApplicationContext();
  const [value, setValue] = useState(options[0]);
  const changeHandler = (option: Waveform) => {
    setValue(option);
  };

  useEffect(() => {
    setWaveform(value);
  }, [value]);

  return (
    <div className={styles.WaveformSelector}>
      <Label>{"Select Waveform"}</Label>
      <SelectBox options={options} onChange={changeHandler} initialValue={value} />
    </div>
  );
};

export default WaveFormSelector;
