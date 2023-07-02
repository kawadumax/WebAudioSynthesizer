import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useEffect,
} from "react";
import { SoundSource, Tone } from "./TypeCircuit";

// 現在再生中のオシレータを格納し管理する配列
type SoundSourceState = { previous: SoundSource[]; current: SoundSource[] };

type SoundSourceAction =
  | { type: "ADD"; payload: Tone }
  | { type: "REMOVE"; payload: Tone }
  | { type: "DROP" };

const soundSourceReducer = (
  state: SoundSourceState,
  action: SoundSourceAction
): SoundSourceState => {
  let prev: SoundSource[];
  let current: SoundSource[];
  switch (action.type) {
    case "ADD":
      console.log("ADD occured:", action.payload.name);
      //payloadのtoneが既にstate.currentに存在していたら現在のstateをそのまま返す。
      // if (state.current.includes(action.payload)) {
      //   console.log("already added");
      //   return state;
      // }
      // return {
      //   previous: [...state.current],
      //   current: [...state.current, action.payload],
      // };
      prev = [...state.current];
      current = [...state.current, { oscNode: undefined, tone: action.payload }];
      break;
    case "REMOVE":
      // console.log("REMOVE occured:", action.payload.name);
      // current = state.current.filter(
      //   (ss) => ss.tone.name !== action.payload.name
      // )
      // return {
      //   previous: [...state.current],
      //   current: [...current],
      // };
      prev = [...state.current];
      current = state.current.filter(
        (ss) => ss.tone.name !== action.payload.name
      )
      break;
    case "DROP":
      // return {
      //   previous: [...state.current],
      //   current: [],
      // };
      prev = [...state.current];
      current = [];
      break;
    default:
      // return state;
      prev = state.previous;
      current = state.current;
      break;
  }
  //更新した状態をもとに、発音状態を変更する
  //applyState();


  return {
    previous: prev,
    current: current
  }
};

interface Props {
  children: React.ReactNode;
}

interface AudioContextContainer {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
  soundSourceState: { previous: SoundSource[]; current: SoundSource[] };
  createAudioContext: () => void;
  closeAudioContext: () => void;
  startOscillator: (tone: Tone) => void;
  stopOscillator: (tone: Tone) => void;
  stopOscillatorAll: () => void;
}

const AudioContextContainer = createContext<AudioContextContainer>({
  audioContext: null,
  gainNode: null,
  soundSourceState: { previous: [], current: [] },
  createAudioContext: () => { },
  closeAudioContext: () => { },
  startOscillator: () => { },
  stopOscillator: () => { },
  stopOscillatorAll: () => { },
});

const AudioContextCircuit = ({ children }: Props) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [soundSourceState, dispatch] = useReducer(soundSourceReducer, {
    previous: [],
    current: [],
  });

  useEffect(() => {
    console.log("effect Occured:", soundSourceState);

    if (!audioContext || !gainNode) return;
    // if (findSoundSource(tone)) {
    //   console.log("already sounded: ", findSoundSource(tone));
    //   return;
    // } //既に音が鳴っている場合は早期リターン

    //stateの変更差分を見て、差分に対して音を鳴らしたり止めたりする
    //previousとcurrentの共通する要素を取得して、その共通部分をpreviousとcurrentそれぞれから引く
    const prev = new Set(soundSourceState.previous);
    const current = new Set(soundSourceState.current);

    const filteredPrev = soundSourceState.previous.filter(
      (item) => !current.has(item)
    );
    const filteredCurrent = soundSourceState.current.filter(
      (item) => !prev.has(item)
    );

    console.log("previous state:", filteredPrev); // Output: [1, 2]
    console.log("current state:", filteredCurrent); // Output: [6, 7]

    //previousに残った集合は、音を止める集合
    for (const ss of filteredPrev) {
      console.log("stop osc:", ss.tone.name, ss.oscNode);
      ss.oscNode?.stop();
    }
    //currentに残った集合は、音を鳴らす集合
    for (const ss of filteredCurrent) {
      ss.oscNode = audioContext.createOscillator();
      ss.oscNode.connect(gainNode);
      ss.oscNode.frequency.setValueAtTime(
        ss.tone.freq,
        audioContext.currentTime
      );
      ss.oscNode.type = "sine";
      ss.oscNode.start();
      ss.oscNode.onended = () => {
        ss.oscNode?.disconnect(gainNode);
      };
    }
  }, [soundSourceState.previous, soundSourceState.current]);

  const createAudioContext = () => {
    const audioContext = new AudioContext();
    setAudioContext(audioContext);
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.connect(audioContext.destination);
    setGainNode(gainNode);
  };

  const closeAudioContext = () => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setGainNode(null);
    }
  };

  const startOscillator = (tone: Tone) => {
    // if (!audioContext || !gainNode) return;
    // if (findSoundSource(tone)) {
    //   console.log("already sounded: ", findSoundSource(tone));
    //   return;
    // } //既に音が鳴っている場合は早期リターン

    console.log("will sound: ", tone);
    // const oscillatorNode = audioContext.createOscillator();
    // oscillatorNode.connect(gainNode);
    // oscillatorNode.frequency.setValueAtTime(
    //   tone.freq,
    //   audioContext.currentTime
    // );
    // oscillatorNode.type = "sine";
    // oscillatorNode.start();
    // oscillatorNode.onended = () => {
    //   oscillatorNode.disconnect(gainNode);
    // };
    dispatch({
      type: "ADD",
      payload: { tone: tone },
    });
  };

  const stopOscillator = (tone: Tone) => {
    dispatch({ type: "REMOVE", payload: tone });
  };

  const stopOscillatorAll = () => {
    dispatch({ type: "DROP" });
  };

  const findSoundSource = (tone: Tone) => {
    return soundSourceState.current.find((ss) => ss.tone.name === tone.name);
  };

  return (
    <AudioContextContainer.Provider
      value={{
        audioContext,
        gainNode,
        soundSourceState,
        createAudioContext,
        closeAudioContext,
        startOscillator,
        stopOscillator,
        stopOscillatorAll,
      }}
    >
      {children}
    </AudioContextContainer.Provider>
  );
};

export const useAudioContextCircuit = () => useContext(AudioContextContainer);

export default AudioContextCircuit;
