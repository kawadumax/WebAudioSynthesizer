import { useState, useCallback } from "react";

const useKeyboardCircuit = () => {
  const getFreqByToneNumber = (tone: number) => {
    return Math.exp((tone / 12) * Math.log(2));
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
  const aPitches = { A3: 220, A2: 110, A1: 55, A0: 27.5 };
  // const minPitch = { A0: standardTuningPitch["A4"] / 16 };

  return { allToneNames };
};

export default useKeyboardCircuit;
