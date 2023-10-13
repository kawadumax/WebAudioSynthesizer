import "@styles/Synth.scss";
import MasterVolumeKnob from "@/components/controls/MasterVolumeKnob";
import TremoloFrequencyKnob from "./controls/TremoloFrequencyKnob";
import TremoloDepthKnob from "./controls/TremoloDepthKnob";
import TremoloToggle from "@components/controls/TremoloToggle";
import Keyboard from "@components/controls/Keyboard";
import { useAudioContextProvider } from "@circuits/AudioContextCircuit/AudioContextProvider";
import { KeyboardContextProvider } from "@circuits/KeyboardCircuit";

const Synth = () => {
  const { audioContext } = useAudioContextProvider();
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
