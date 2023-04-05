import React, { useEffect, useState } from "react";
import "@styles/Synth.scss";
import GainKnob from "@components/controls/GainKnob";
import PowerToggle from "./controls/PowerToggle";

const Synth = () => {
  // オーディオコンテキストの初期化
  const [synthEnabled, setSynthEnabled] = useState(false);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // ここにオーディオ関連の処理を記述します
    const audioContext = new window.AudioContext();
    setAudioContext(audioContext);

    // コンポーネントのクリーンアップ時にオーディオコンテキストを閉じます
    return () => {
      audioContext.close();
    };
  }, []); // 空の依存配列を指定して、このエフェクトをコンポーネントのマウント時にのみ実行します

  useEffect(() => {
    if (audioContext === null) {
      return;
    }

    if (synthEnabled) {
      // シンセサイザをオンにする処理
      const gainNode = audioContext.createGain();
      const oscillator = audioContext.createOscillator();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillator.type = "sine";

      oscillator.start();

      oscillator.onended = () => {
        oscillator.disconnect(gainNode);
        gainNode.disconnect(audioContext.destination);
      };

      setOscillator(oscillator);
    } else {
      if (oscillator) {
        oscillator.stop();
      }
    }
  }, [synthEnabled]);

  const handlePowerChange = (power: boolean) => {
    if (audioContext === null) {
      return;
    }
    setSynthEnabled(power);
  };

  return (
    <div className="synth" id="synth">
      {audioContext && <GainKnob audioContext={audioContext}></GainKnob>}
      <PowerToggle onPower={handlePowerChange}></PowerToggle>
    </div>
  );
};

export default Synth;
