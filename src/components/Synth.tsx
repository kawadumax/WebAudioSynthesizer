import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import Keyboard from "@components/controls/Keyboard";
import style from "@styles/Synth.module.scss";
import MasterVolumeKnob from "@/components/controls/MasterVolumeKnob";
import KeyboardContextProvider from "./circuits/KeyboardCircuit/KeyboardContextProvider";
import InsertFxRack from "./controls/InsertFxRack";
import InsertFxStatus from "./controls/InsertFxStatus";
import Oscilloscope from "./controls/Oscilloscope";
import PowerToggle from "./controls/PowerToggle";
import WaveformSelector from "./controls/WaveformSelector";

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
          {/* InsertFxStatus moved to InsertFxRack */}
        </div>
      </div>
      <KeyboardContextProvider>
        <Keyboard numOfKeys={24} width={1200} height={300}></Keyboard>
      </KeyboardContextProvider>
    </div>
  );
};

export default Synth;
