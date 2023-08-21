import { renderHook, act } from "@testing-library/react";
import { useSoundStatesEffect } from "@/components/circuits/AudioContextCircuit/AudioEffect";
import { soundStateReducer } from "@circuits/AudioContextCircuit/SoundStateReducer";
import { SoundState, SoundStateAction, Tone } from "@circuits/TypeCircuit";
import React, { Dispatch, useReducer } from "react";


describe("AudioContextCircuit", () => {
  const testTone = { name: "A", freq: 440 }

  describe("useSoundStatesEffect", () => {
    let audioContextMock: Partial<AudioContext>;
    let gainNodeMock: Partial<GainNode>;
    let soundStatesMock: Partial<SoundState[]>
    let dispatchMock: Partial<React.Dispatch<SoundStateAction>>
    let hookResult: ReturnType<typeof runRenderHook>;
    function runRenderHook() {
      return renderHook((soundState) => useSoundStatesEffect(
        audioContextMock as AudioContext,
        gainNodeMock as GainNode,
        soundState as SoundState[],
        dispatchMock as Dispatch<SoundStateAction>
      ), { initialProps: soundStatesMock });
    };


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
              value: undefined
            } as Partial<AudioParam>,
          } as Partial<OscillatorNode>
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
          isEnded: false
        };
        soundStatesMock = [testSoundState]
        hookResult.rerender(soundStatesMock);
      });
      expect(audioContextMock.createOscillator).toBeCalledTimes(1);
      expect(soundStatesMock[0]?.oscillator).toBeTruthy;
    })

    it("オシレータが追加されたあと、isEndedをtrueにするとオシレータが削除される", () => {
      expect(audioContextMock.createOscillator).toBeCalledTimes(0);
      act(() => {
        const testSoundState: SoundState = {
          tone: testTone,
          isStarted: true,
          isEnded: false
        };
        soundStatesMock = [testSoundState]
        hookResult.rerender(soundStatesMock);
      });
      expect(audioContextMock.createOscillator).toBeCalledTimes(1);
      expect(soundStatesMock[0]?.oscillator).toBeTruthy;
      act(() => {
        if (soundStatesMock[0]) {
          soundStatesMock[0].isEnded = true;
        };
        soundStatesMock = [...soundStatesMock];
        hookResult.rerender(soundStatesMock);
      });
      expect(audioContextMock.createOscillator).toBeCalledTimes(1);
      expect(dispatchMock).toBeCalledTimes(1);
      expect(soundStatesMock).toHaveLength(1);
      expect(soundStatesMock[0]?.oscillator).toBeFalsy;
    })
  })

  describe("useSoundStatesReducer", () => {
    describe("dispatch経由でsoundReducerを実行してsoundStatesがどう変わるか", () => {
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
      })

      it("START_SOME", () => {
        const hookResult = renderHook(() => useReducer(soundStateReducer, []));
        // console.log(hookResult.result.current[0]);
        let [soundStates, dispatch] = hookResult.result.current;
        expect(soundStates).toHaveLength(0);
        const tones = [
          { freq: 440, name: "A4" },
          { freq: 493.8833012561241, name: "B4" }
        ]
        act(() => {
          dispatch({ type: "START_SOME", payload: tones });
          hookResult.rerender();
        });
        // console.log(hookResult.result.current);
        expect(hookResult.result.current[0]).toHaveLength(2);
      })
      it.todo("STOP")
      it.todo("STOP_EXCEPT")
      it.todo("STOP_EXCEPTS")
      it.todo("STOP_ALL")
      it.todo("CLEAR")
    })
  })

});
