import Keyboard from "@components/controls/Keyboard";
import style from "@styles/Synth.module.scss";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import MasterVolumeKnob from "@/components/controls/MasterVolumeKnob";
import KeyboardContextProvider from "./circuits/KeyboardCircuit/KeyboardContextProvider";
import Oscilloscope from "./controls/Oscilloscope";
import PowerToggle from "./controls/PowerToggle";
import TremoloDepthKnob from "./controls/TremoloDepthKnob";
import TremoloFrequencyKnob from "./controls/TremoloFrequencyKnob";
import WaveformSelector from "./controls/WaveformSelector";

const Synth = () => {
  const { isReady } = useAudioEngine();

  return (
    <div className="synth" id={style.synth}>
      {!isReady && <p>Initialize Audio Engine...</p>}
      <div id={style["synth-controls"]}>
        <div id={style["toremolo-unit"]}>
          {/* <TremoloToggle></TremoloToggle> */}
          <TremoloFrequencyKnob></TremoloFrequencyKnob>
          <TremoloDepthKnob></TremoloDepthKnob>
        </div>
        <div id={style["oscilloscope-unit"]}>
          <WaveformSelector></WaveformSelector>
          <Oscilloscope></Oscilloscope>
        </div>
        <div id={style["global-unit"]}>
          <MasterVolumeKnob></MasterVolumeKnob>
          <PowerToggle></PowerToggle>
        </div>
      </div>
      <KeyboardContextProvider>
        <Keyboard numOfKeys={24} width={1200} height={300}></Keyboard>
      </KeyboardContextProvider>
    </div>
  );
};

export default Synth;

