import Label from "@parts/Label";
import Led from "@parts/Led";
import Toggle from "@parts/Toggle";
import style from "@styles/controls/PowerToggle.module.scss";
import { useEffect, useState } from "react";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";

const PowerToggle = () => {
  const { engine, initEngine } = useAudioEngine();
  const [power, setPower] = useState(false);
  const handlePower = () => {
    setPower((prev) => !prev);
  };

  useEffect(() => {
    let isActive = true;
    const updatePowerState = async () => {
      if (power) {
        if (!engine.isInitialized()) {
          await initEngine();
        }
        if (!isActive) return;
        await engine.resume();
      } else {
        await engine.suspend();
      }
    };
    void updatePowerState();
    return () => {
      isActive = false;
    };
  }, [engine, initEngine, power]);

  return (
    <div className={style["power-toggle"]}>
      <Label>Power</Label>
      <Led className={style["power-toggle-led"]} isActive={power}></Led>
      <Toggle onToggle={handlePower}></Toggle>
    </div>
  );
};

export default PowerToggle;

