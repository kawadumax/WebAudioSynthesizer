import React, { useEffect, useState } from "react";

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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioContext === null) {
      return;
    }

    setSynthEnabled(event.target.checked);

    if (event.target.checked) {
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
  };

  return (
    <div className="Synth">
      <label htmlFor="synthToggle">Synth On/Off</label>
      <input
        type="checkbox"
        id="synthToggle"
        checked={synthEnabled}
        onChange={handleCheckboxChange}
      />
    </div>
  );
};

export default Synth;
