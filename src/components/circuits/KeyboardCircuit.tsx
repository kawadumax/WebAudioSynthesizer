import { useState, useCallback } from "react";

const useKeyboardCircuit = () => {
  const getFreqByToneNumber = (tone: number) => {
    //1オクターブで周波数が2倍なので、半音上がると2の十二乗根倍になる。
    //これを元に、48番目の音階であるA4=440hzを基準として計算で周波数を求める。
    return standardTuningPitch.A4 * Math.exp(((tone - 48) / 12) * Math.log(2));
  };

  const toneNamesSharp = [
    "A",
    "A#",
    "B",
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
  ];
  const toneNamesFlat = [
    "A",
    "Bb",
    "B",
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
  ];
  const octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const allToneNames = octaves.flatMap((octave) =>
    toneNamesSharp.map((tone) => tone + octave)
  );
  const standardTuningPitch = { A4: 440 };
  // const aPitches = { A3: 220, A2: 110, A1: 55, A0: 27.5 };
  // const minPitch = { A0: standardTuningPitch["A4"] / 16 };

  const wholeTones = allToneNames.map((tone, index) => {
    return {
      [tone]: getFreqByToneNumber(index),
    };
  });

  const naturalTones = wholeTones.filter((obj) => {
    const key = Object.keys(obj);
    return key.length < 3;
  });

  return { wholeTones, naturalTones };
};

export default useKeyboardCircuit;
