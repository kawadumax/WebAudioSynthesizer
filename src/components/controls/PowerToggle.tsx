import Label from "@parts/Label";
import Led from "@parts/Led";
import Toggle from "@parts/Toggle";
import style from "@styles/controls/PowerToggle.module.scss";
import { useEffect } from "react";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";

const PowerToggle = () => {
  const { engine, initEngine, isPowered, setIsPowered } = useAudioEngine();
  const handlePower = (next: boolean) => {
    setIsPowered(next);
  };

  useEffect(() => {
    let isActive = true;
    const updatePowerState = async () => {
      if (isPowered) {
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
  }, [engine, initEngine, isPowered]);

  return (
    <div className={style["power-toggle"]}>
      <Label>Power</Label>
      <Led className={style["power-toggle-led"]} isActive={isPowered}></Led>
      <Toggle isOn={isPowered} onToggle={handlePower}></Toggle>
    </div>
  );
};

export default PowerToggle;

