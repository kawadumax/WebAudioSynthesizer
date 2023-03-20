import React, { useEffect, useState } from "react";

const Synth = () => {
  useEffect(() => {
    // オーディオコンテキストの初期化
    const audioContext = new (window.AudioContext || window.AudioContext)();

    // ここにオーディオ関連の処理を記述します
    const gainNode = audioContext.createGain();
    const oscillator = audioContext.createOscillator();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    oscillator.type = "sine";
    // oscillator.start();

    // コンポーネントのクリーンアップ時にオーディオコンテキストを閉じます
    return () => {
      audioContext.close();
    };
  }, []); // 空の依存配列を指定して、このエフェクトをコンポーネントのマウント時にのみ実行します

  const [synthEnabled, setSynthEnabled] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSynthEnabled(event.target.checked);
    if (event.target.checked) {
      // シンセサイザをオンにする処理
    } else {
      // シンセサイザをオフにする処理
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
