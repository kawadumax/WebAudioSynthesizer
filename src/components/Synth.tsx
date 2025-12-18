import { useApplicationContext } from "@circuits/AudioCircuit/ApplicationContextProvider";
import Keyboard from "@components/controls/Keyboard";
import style from "@styles/Synth.module.scss";
import MasterVolumeKnob from "@/components/controls/MasterVolumeKnob";
import KeyboardContextProvider from "./circuits/KeyboardCircuit/KeyboardContextProvider";
import Oscilloscope from "./controls/Oscilloscope";
import PowerToggle from "./controls/PowerToggle";
import TremoloDepthKnob from "./controls/TremoloDepthKnob";
import TremoloFrequencyKnob from "./controls/TremoloFrequencyKnob";
import WaveformSelector from "./controls/WaveformSelector";

const Synth = () => {
  const { audioContext } = useApplicationContext();
  const renderSynth = (audioContext: AudioContext | null) => {
    if (audioContext) {
      return (
        <>
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
        </>
      );
    } else {
      return <p>Initialize Audio Context...</p>;
    }
  };

  return (
    <div className="synth" id={style.synth}>
      {renderSynth(audioContext)}
    </div>
  );
};

export default Synth;
