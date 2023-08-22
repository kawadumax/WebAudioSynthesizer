import { renderHook, act } from "@testing-library/react";
import { useSoundStatesEffect } from "@/components/circuits/AudioContextCircuit/AudioEffect";
import { soundStateReducer } from "@circuits/AudioContextCircuit/SoundStateReducer";
import { SoundState, SoundStateAction, Tone } from "@circuits/TypeCircuit";
import React, { Dispatch, useReducer } from "react";

describe("jest SandBox", () => {
  it("true = truthy", () => {
    expect(true).toBeFalsy;
  })
})

describe("AudioContextCircuit", () => {
  const testTone = { name: "A4", freq: 440 };

  describe("useSoundStatesEffect", () => {
    let audioContextMock: Partial<AudioContext>;
    let gainNodeMock: Partial<GainNode>;
    let soundStatesMock: Partial<SoundState[]>;
    let dispatchMock: Partial<React.Dispatch<SoundStateAction>>;
    let hookResult: ReturnType<typeof runRenderHook>;
    function runRenderHook() {
      return renderHook(
        (soundState) =>
          useSoundStatesEffect(
            audioContextMock as AudioContext,
            gainNodeMock as GainNode,
            soundState as SoundState[],
            dispatchMock as Dispatch<SoundStateAction>
          ),
        { initialProps: soundStatesMock }
      );
    }

    beforeEach(() => {
      // AudioContextとGainNodeのモックをセットアップ
      audioContextMock = {
        // 必要に応じてメソッドやプロパティをモックする
        createOscillator: jest.fn().mockImplementation(() => {
          return {
            connect: jest.fn(),
            disconnect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            frequency: {
              value: undefined,
            } as Partial<AudioParam>,
          } as Partial<OscillatorNode>;
        }),
      };
      gainNodeMock = {
        // 必要に応じてメソッドやプロパティをモックする
      };
      soundStatesMock = [];
      dispatchMock = jest.fn();
      hookResult = runRenderHook();
    });

    it("soundStateにToneを追加したとき、useSoundStatesEffectが呼ばれてオシレーターが追加される", () => {
      expect(audioContextMock.createOscillator).toBeCalledTimes(0);
      act(() => {
        const testSoundState: SoundState = {
          tone: testTone,
          isStarted: true,
          isEnded: false,
        };
        soundStatesMock = [testSoundState];
        hookResult.rerender(soundStatesMock);
      });
      expect(audioContextMock.createOscillator).toBeCalledTimes(1);
      expect(soundStatesMock[0]?.oscillator).toBeTruthy();
    });

    it("オシレータが追加されたあと、isEndedをtrueにするとオシレータが削除される", () => {
      expect(audioContextMock.createOscillator).toBeCalledTimes(0);
      act(() => {
        const testSoundState: SoundState = {
          tone: testTone,
          isStarted: true,
          isEnded: false,
        };
        soundStatesMock = [testSoundState];
        hookResult.rerender(soundStatesMock);
      });
      expect(audioContextMock.createOscillator).toBeCalledTimes(1);
      expect(soundStatesMock[0]?.oscillator).toBeTruthy();
      act(() => {
        if (soundStatesMock[0]) {
          soundStatesMock[0].isEnded = true;
        }
        soundStatesMock = [...soundStatesMock];
        hookResult.rerender(soundStatesMock);
      });
      expect(audioContextMock.createOscillator).toBeCalledTimes(1);
      expect(dispatchMock).toBeCalledTimes(1);
      expect(soundStatesMock).toHaveLength(1);
      expect(soundStatesMock[0]?.oscillator).toBeFalsy();
    });
  });

  describe("useSoundStatesReducer", () => {
    describe("dispatch経由でsoundReducerを実行してsoundStatesがどう変わるか", () => {
      const testTone = { freq: 440, name: "A4" };
      const testTones = [
        testTone,
        { freq: 493.8833012561241, name: "B4" },
      ];


      it("START", () => {
        const hookResult = renderHook(() => useReducer(soundStateReducer, []));
        // console.log(hookResult.result.current[0]);
        let [soundStates, dispatch] = hookResult.result.current;
        expect(soundStates).toHaveLength(0);
        act(() => {
          dispatch({ type: "START", payload: testTone });
          hookResult.rerender();
        });
        // console.log(hookResult.result.current);
        expect(hookResult.result.current[0]).toHaveLength(1);
      });

      it("START_SOME", () => {
        const hookResult = renderHook(() => useReducer(soundStateReducer, []));
        // console.log(hookResult.result.current[0]);
        let [soundStates, dispatch] = hookResult.result.current;
        expect(soundStates).toHaveLength(0);

        act(() => {
          dispatch({ type: "START_SOME", payload: testTones });
          hookResult.rerender();
        });
        // console.log(hookResult.result.current);
        expect(hookResult.result.current[0]).toHaveLength(2);
      });

      it("STOP", () => {
        const hookResult = renderHook(() => useReducer(soundStateReducer, []));
        let [soundStates, dispatch] = hookResult.result.current;
        expect(soundStates).toHaveLength(0);
        act(() => {
          dispatch({ type: "START", payload: testTone });
          hookResult.rerender();
        });
        expect(hookResult.result.current[0]).toHaveLength(1);
        act(() => {
          dispatch({ type: "STOP", payload: testTone });
          hookResult.rerender();
        });
        expect(hookResult.result.current[0]).toHaveLength(1);
        // console.log(hookResult.result.current[0]);
        expect(hookResult.result.current[0][0].isEnded).toBeTruthy();
      });
      it("STOP_EXCEPT", () => {
        const hookResult = renderHook(() => useReducer(soundStateReducer, []));
        let [soundStates, dispatch] = hookResult.result.current;
        expect(soundStates).toHaveLength(0);
        act(() => {
          dispatch({ type: "START_SOME", payload: testTones });
          hookResult.rerender();
        });
        expect(hookResult.result.current[0]).toHaveLength(2);
        act(() => {
          dispatch({ type: "STOP_EXCEPT", payload: testTone });
          hookResult.rerender();
        });
        expect(hookResult.result.current[0]).toHaveLength(2);
        // console.log(hookResult.result.current[0]);
        expect(hookResult.result.current[0][0].isEnded).toBeFalsy();
        expect(hookResult.result.current[0][1].isEnded).toBeTruthy();
      });
      it.todo("STOP_EXCEPTS");
      it.todo("STOP_ALL");
      it.todo("CLEAR");
    });
  });
});
