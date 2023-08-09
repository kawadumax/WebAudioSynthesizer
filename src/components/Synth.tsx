import { useEffect, useState } from "react";
import "@styles/Synth.scss";
import GainKnob from "@components/controls/GainKnob";
import FXFrequencyKnob from "./controls/FXFrequencyKnob";
import FXDepthKnob from "./controls/FXDepthKnob";
import FXToggle from "@components/controls/FXToggle";
import PowerToggle from "@components/controls/PowerToggle";
import Keyboard from "@components/controls/Keyboard";
import { useAudioContextCircuit } from "./circuits/AudioContextCircuit/AudioContextProvider";
import { KeyboardContextProvider } from './circuits/KeyboardCircuit';

const Synth = () => {
  // オーディオコンテキストの初期化
  const [synthEnabled, setSynthEnabled] = useState(false);
  const { audioContext, createAudioContext, closeAudioContext } =
    useAudioContextCircuit();

  const handlePowerChange = (power: boolean) => {
    if (audioContext === null) {
      return;
    }
    setSynthEnabled(power);
  };

  const renderSynth = (audioContext: AudioContext | null) => {
    if (audioContext) {
      return (
        <>
          <div id="synth-controls">
            <div id="toremolo-unit">
              <FXToggle></FXToggle>
              <FXFrequencyKnob></FXFrequencyKnob>
              <FXDepthKnob></FXDepthKnob>
            </div>
            <div id="global-unit">
              <GainKnob></GainKnob>
            </div>
          </div>
          <KeyboardContextProvider>
            <Keyboard
              numOfKeys={24}
              width={1200}
              height={300}
            ></Keyboard>
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
