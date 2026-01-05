import Keyboard from "@components/controls/Keyboard";
import style from "@styles/Synth.module.scss";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import MasterVolumeKnob from "@/components/controls/MasterVolumeKnob";
import KeyboardContextProvider from "./circuits/KeyboardCircuit/KeyboardContextProvider";
import Oscilloscope from "./controls/Oscilloscope";
import PowerToggle from "./controls/PowerToggle";
import InsertFxRack from "./controls/InsertFxRack";
import WaveformSelector from "./controls/WaveformSelector";
import InsertFxStatus from "./controls/InsertFxStatus";

const Synth = () => {
  const { isInitializing } = useAudioEngine();

  return (
    <div className="synth" id={style.synth}>
      {isInitializing && <p>Initializing....</p>}
      <div id={style["synth-controls"]}>
        <div id={style["insert-fx-unit"]}>
          <InsertFxRack></InsertFxRack>
        </div>
        <div id={style["oscilloscope-unit"]}>
          <WaveformSelector></WaveformSelector>
          <Oscilloscope></Oscilloscope>
        </div>
        <div id={style["global-unit"]}>
          <MasterVolumeKnob></MasterVolumeKnob>
          <PowerToggle></PowerToggle>
          <InsertFxStatus></InsertFxStatus>
        </div>
      </div>
      <KeyboardContextProvider>
        <Keyboard numOfKeys={24} width={1200} height={300}></Keyboard>
      </KeyboardContextProvider>
    </div>
  );
};

export default Synth;

