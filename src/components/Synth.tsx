import "@styles/Synth.scss";
import MasterVolumeKnob from "@/components/controls/MasterVolumeKnob";
import TremoloFrequencyKnob from "./controls/TremoloFrequencyKnob";
import TremoloDepthKnob from "./controls/TremoloDepthKnob";
import Keyboard from "@components/controls/Keyboard";
import { useApplicationContext } from "@circuits/AudioContextCircuit/ApplicationContextProvider";
import { KeyboardContextProvider } from "@circuits/KeyboardCircuit";
import Oscilloscope from "./controls/Oscilloscope";
import WaveformSelector from "./controls/WaveformSelector";

const Synth = () => {
  const { audioContext } = useApplicationContext();
  const renderSynth = (audioContext: AudioContext | null) => {
    if (audioContext) {
      return (
        <>
          <div id="synth-controls">
            <div id="toremolo-unit">
              {/* <TremoloToggle></TremoloToggle> */}
              <TremoloFrequencyKnob></TremoloFrequencyKnob>
              <TremoloDepthKnob></TremoloDepthKnob>
            </div>
            <div id="oscilloscope-unit">
              <WaveformSelector></WaveformSelector>
              <Oscilloscope></Oscilloscope>
            </div>
            <div id="global-unit">
              <MasterVolumeKnob></MasterVolumeKnob>
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
    <div className="synth" id="synth">
      {renderSynth(audioContext)}
    </div>
  );
};

export default Synth;
