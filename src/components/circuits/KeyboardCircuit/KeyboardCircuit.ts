import { useApplicationContext } from "../AudioCircuit/ApplicationContextProvider";
import { Tone } from "@/modules/Type";
import {
  containsPoint,
  mapToDOMRects,
  Point,
  splitArray,
  findRectIndex,
} from "@/modules/utils/DomUtils";

const toneNumberToFreq = (tone: number) => {
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

const wholeTones: Tone[] = allToneNames.map((tone, index) => {
  return {
    name: tone,
    freq: toneNumberToFreq(index),
  };
});

const wholeNaturalTones = wholeTones.filter((tone) => {
  return tone.name.length < 3;
});

const wholeAccidentalTones = wholeTones.filter((tone) => {
  return tone.name.length >= 3;
});

export const makeSequencedKeys = (startIndex: number, endIndex: number) => {
  const rangedWholeTones = wholeTones.slice(startIndex, endIndex);

  const rangedNaturalTones = rangedWholeTones.filter((tone) => {
    return tone.name.length < 3;
  });

  const rangedAccidentalTones = rangedWholeTones.filter((tone) => {
    return tone.name.length >= 3;
  });
  return { rangedWholeTones, rangedNaturalTones, rangedAccidentalTones };
};

const getBlackTone = (
  keyElements: Element[],
  position: Point
): Tone | undefined => {
  return (
    getBlackTone(keyboardSVG, position) || getWhiteTone(keyboardSVG, position)
  );
};

const getBlackTone = (
  svg: SVGSVGElement,
  position: Point
): Tone | undefined => {
  const keys = svg.children;
  const keyRects = Array.from(keys).map((key) => key.getBoundingClientRect());
  const blackKeyRects = keyRects.slice(naturalTones.length);
  if (position.y > blackKeyRects[0].bottom) {
    //タッチのy座標がキーボードの下半分にあるとき、早期リターン
    return;
  }

  const touchedKeyIndex = blackKeyRects.findIndex((rect) => {
    return containsPoint(rect, position);
  });

  return accidentalTones[touchedKeyIndex];
};

const getWhiteTone = (
  svg: SVGSVGElement,
  position: Point
): Tone | undefined => {
  const keyboardRect = svg.getBoundingClientRect();
  const scaledWhiteKeyWidth = keyboardRect.width / naturalTones.length;
  // タッチの座標が各鍵盤のどの領域にあるのかを判定する。
  const touchedKeyOrder = Math.floor(
    (position.x - keyboardRect.left) / scaledWhiteKeyWidth
  );
  return naturalTones[touchedKeyOrder];
};

const getTones = (position: Point): Tone | undefined => {
  const keyboardSVG = refSVG.current;
  if (
    keyboardSVG &&
    containsPoint(keyboardSVG.getBoundingClientRect(), position)
  ) {
    return (
      getBlackTones(keyboardSVG, position) ||
      getWhiteTones(keyboardSVG, position)
    );
  }
};

const getBlackTones = (
  svg: SVGSVGElement,
  position: Point
): Tone | undefined => {
  const keys = svg.children;
  const keyRects = Array.from(keys).map((key) => key.getBoundingClientRect());
  const blackKeyRects = keyRects.slice(naturalTones.length);
  if (position.y > blackKeyRects[0].bottom) {
    //タッチのy座標がキーボードの下半分にあるとき、早期リターン
    return;
  }

  const touchedKeyIndex = blackKeyRects.findIndex((rect) => {
    return containsPoint(rect, position);
  });

  return accidentalTones[touchedKeyIndex];
};

const getWhiteTones = (
  svg: SVGSVGElement,
  position: Point
): Tone | undefined => {
  const keyboardRect = svg.getBoundingClientRect();
  const scaledWhiteKeyWidth = keyboardRect.width / naturalTones.length;
  // タッチの座標が各鍵盤のどの領域にあるのかを判定する。
  const touchedKeyOrder = Math.floor(
    (position.x - keyboardRect.left) / scaledWhiteKeyWidth
  );
  return naturalTones[touchedKeyOrder];
};

const getKeyIndexes = (keys: HTMLCollection, points: Point[]): number[] => {
  const keyRects = mapToDOMRects(keys);
  const [whiteKeyRects, blackKeyRects] = splitArray(
    keyRects,
    naturalTones.length
  );

  const touchedKeyIndexes = points
    .map((point) => {
      return (
        findRectIndex(blackKeyRects, point) ||
        findRectIndex(whiteKeyRects, point)
      );
    })
    .filter((index) => index !== undefined) as number[];
  if (!touchedKeyIndexes) return [];
  return touchedKeyIndexes;
};

const {
  startOscillator,
  startOscillatorSome,
  stopOscillator,
  stopOscillatorExcept,
  stopOscillatorExcepts,
  stopOscillatorAll,
} = useApplicationContext();

export const SoundHandlers = {
  handleStartSound: (tone: Tone) => {
    startOscillator(tone);
  },

  handleStartSomeSounds: (tones: Tone[]) => {
    startOscillatorSome(tones);
  },

  handleStopSound: (tone: Tone) => {
    stopOscillator(tone);
  },

  handleStartAndStopExceptSound: (tone: Tone | undefined) => {
    if (tone) {
      startOscillator(tone);
      stopOscillatorExcept(tone);
    } else {
      stopOscillatorAll();
    }
  },

  handleStopExcepts: (tones: Tone[]) => {
    stopOscillatorExcepts(tones);
  },

  handleStopAllSound: () => {
    stopOscillatorAll();
  },
};
