// 他のコンポーネントまたはページで

import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import SelectBox from "@components/parts/SelectBox";
import styles from "@styles/controls/WaveformSelector.module.scss";
import type React from "react";
import { useEffect, useState } from "react";
import type { Waveform } from "@/modules/AudioEngine/types";
import Label from "../parts/Label";

const options: Waveform[] = ["sine", "square", "sawtooth", "triangle"];

const WaveFormSelector: React.FC = () => {
  const { engine, isPowered } = useAudioEngine();
  const [value, setValue] = useState<Waveform | null>(null);
  const changeHandler = (option: Waveform) => {
    setValue(option);
  };

  useEffect(() => {
    if (value) {
      engine.setWaveform(value);
    }
  }, [engine, value]);

  // Removed auto-reset to sine on power toggle to prevent state fighting
  // useEffect(() => {
  //   if (isPowered && value !== "sine") {
  //     setValue("sine");
  //   }
  // }, [isPowered, value]);

  return (
    <div className={styles.WaveformSelector}>
      <Label>{"Select Waveform"}</Label>
      <SelectBox options={options} onChange={changeHandler} initialValue={value ?? undefined} />
    </div>
  );
};

export default WaveFormSelector;
