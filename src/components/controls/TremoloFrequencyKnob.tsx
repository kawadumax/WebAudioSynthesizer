import Knob from "@parts/Knob";
import Display from "@parts/Display";
import { useAudioContextProvider } from "../circuits/AudioContextCircuit/AudioContextProvider";
import Label from "../parts/Label";
import styles from "@styles/Knob.module.scss";

const TremoloFrequencyKnob = () => {
  return (
    <div className={styles.knob}>
      <Label>Frequency</Label>
      {/* <Knob handleValueChange={handleLFOChange} defaultValue={0.5} />
      <Display parameter={frequency}></Display> */}
    </div>
  );
};

export default TremoloFrequencyKnob;
