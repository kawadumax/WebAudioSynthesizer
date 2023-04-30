import React, { useEffect, useState } from "react";
import "@styles/Synth.scss";
import GainKnob from "@components/controls/GainKnob";
import PowerToggle from "@components/controls/PowerToggle";
import Keyboard from "@components/controls/Keyboard";
import { useAudioContextCircuit } from "./circuits/AudioContextCircuit";
const Synth = () => {
  // オーディオコンテキストの初期化
  const [synthEnabled, setSynthEnabled] = useState(false);
  const {
    audioContext,
    createAudioContext,
    closeAudioContext,
  } = useAudioContextCircuit();

  useEffect(() => {
    // ここにオーディオ関連の処理を記述します
    createAudioContext();

    // コンポーネントのクリーンアップ時にオーディオコンテキストを閉じます
    return () => {
      closeAudioContext();
    };
  }, []); // 空の依存配列を指定して、このエフェクトをコンポーネントのマウント時にのみ実行します

  // useEffect(() => {
  //   if (synthEnabled) {
  //     startOscillator();
  //   } else {
  //     stopOscillator();
  //   }
  // }, [synthEnabled]);

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
          <GainKnob></GainKnob>
          <PowerToggle onPower={handlePowerChange}></PowerToggle>
          <Keyboard
            numOfKeys={24}
            width={1600}
            height={300}
            audioContext={audioContext}
          ></Keyboard>
        </>
      );
    } else {
      return <p>Can Not Initialize Audio Context.</p>;
    }
  };

  return (
    <div className="synth" id="synth">
      {renderSynth(audioContext)}
    </div>
  );
};

export default Synth;
