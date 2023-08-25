import { renderHook, act } from "@testing-library/react";
import { useSoundStatesEffect } from "@/components/circuits/AudioContextCircuit/AudioEffect";
import { soundStateReducer } from "@circuits/AudioContextCircuit/SoundStateReducer";
import { SoundState, SoundStateAction, Tone } from "@circuits/TypeCircuit";
import React, { Dispatch, useReducer } from "react";

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
      // console.log(soundStatesMock[0]);
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
      let renderedHook: ReturnType<typeof runRenderHook>;
      let current: [SoundState[], React.Dispatch<SoundStateAction>];
      let soundStates: SoundState[];
      let dispatch: React.Dispatch<SoundStateAction>;

      const runRenderHook = () => {
        const ret = renderHook(() => useReducer(soundStateReducer, []));
        current = ret.result.current;
        [soundStates, dispatch] = current;
        return ret;
      }

      const getSoundStates = () => renderedHook.result.current[0];
      const getSoundState = (n: number) => renderedHook.result.current[0][n];
      const dispatchAndRerender = (param: SoundStateAction) => {
        return () => {
          dispatch(param);
          renderedHook.rerender();
        }
      };
      beforeEach(() => {
        renderedHook = runRenderHook();
        expect(soundStates).toHaveLength(0);
      })

      it("START", () => {
        act(dispatchAndRerender({ type: "START", payload: testTone }));
        expect(getSoundStates()).toHaveLength(1);
      });

      it("START_SOME", () => {
        act(dispatchAndRerender({ type: "START_SOME", payload: testTones }));
        expect(getSoundStates()).toHaveLength(2);
      });

      it("STOP", () => {
        act(dispatchAndRerender({ type: "START", payload: testTone }));
        expect(getSoundStates()).toHaveLength(1);
        expect(getSoundState(0).isEnded).toBeFalsy();
        act(dispatchAndRerender({ type: "STOP", payload: testTone }));
        expect(getSoundStates()).toHaveLength(1);
        expect(getSoundState(0).isEnded).toBeTruthy();
      });

      it("STOP_EXCEPT", () => {
        act(dispatchAndRerender({ type: "START_SOME", payload: testTones }));
        expect(getSoundStates()).toHaveLength(2);
        act(dispatchAndRerender({ type: "STOP_EXCEPT", payload: testTone }));
        expect(getSoundStates()).toHaveLength(2);
        expect(getSoundState(0).isEnded).toBeFalsy();
        expect(getSoundState(1).isEnded).toBeTruthy();
      });

      it("STOP_EXCEPTS", () => {
        const testTones = [
          testTone,
          { freq: 493.8833012561241, name: "B4" },
          { freq: 880, name: "A5" }
        ];
        const stopTones = [
          testTones[0], testTones[1]
        ]
        act(dispatchAndRerender({ type: "START_SOME", payload: testTones }));
        expect(getSoundStates()).toHaveLength(3);
        act(dispatchAndRerender({ type: "STOP_EXCEPTS", payload: stopTones }));
        expect(getSoundStates()).toHaveLength(3);
        expect(getSoundState(0).isEnded).toBeFalsy();
        expect(getSoundState(1).isEnded).toBeFalsy();
        expect(getSoundState(2).isEnded).toBeTruthy();
      });

      it("STOP_ALL", () => {
        const testTones = [
          testTone,
          { freq: 493.8833012561241, name: "B4" },
          { freq: 880, name: "A5" }
        ];
        act(dispatchAndRerender({ type: "START_SOME", payload: testTones }));
        expect(getSoundStates()).toHaveLength(3);
        act(dispatchAndRerender({ type: "STOP_ALL" }));
        expect(getSoundStates()).toHaveLength(3);
        expect(getSoundState(0).isEnded).toBeTruthy();
        expect(getSoundState(1).isEnded).toBeTruthy();
        expect(getSoundState(2).isEnded).toBeTruthy();
      });
      it("CLEAR", () => {
        const testTones = [
          testTone,
          { freq: 493.8833012561241, name: "B4" },
          { freq: 880, name: "A5" }
        ];
        act(dispatchAndRerender({ type: "START_SOME", payload: testTones }));
        expect(getSoundStates()).toHaveLength(3);
        act(dispatchAndRerender({ type: "CLEAR", payload: testTones[0] }));
        expect(getSoundStates()).toHaveLength(2);
      });
    });
  });

  describe("Check SoundStates with Reducer And Effect", () => {

    //useReducerの初期設定
    const testTone = { freq: 440, name: "A4" };
    const testTones = [
      testTone,
      { freq: 493.8833012561241, name: "B4" },
    ];
    let renderedReducerHook: ReturnType<typeof runRenderReducerHook>;
    let current: [SoundState[], React.Dispatch<SoundStateAction>];
    let soundStates: SoundState[] = [];
    let dispatch: React.Dispatch<SoundStateAction>;

    const runRenderReducerHook = () => {
      const ret = renderHook(() => useReducer(soundStateReducer, []));
      current = ret.result.current;
      [soundStates, dispatch] = current;
      return ret;
    }

    //useEffectの初期設定
    let renderedEffectHook: ReturnType<typeof runRenderEffectHook>;
    function runRenderEffectHook() {
      let audioContextMock: Partial<AudioContext> = {
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
      let gainNodeMock: Partial<GainNode> = {};
      return renderHook(
        (soundState) =>
          useSoundStatesEffect(
            audioContextMock as AudioContext,
            gainNodeMock as GainNode,
            soundState as SoundState[],
            dispatch as Dispatch<SoundStateAction>
          ),
        { initialProps: soundStates }
      );
    }
    const getSoundStates = () => renderedReducerHook.result.current[0];
    const getSoundState = (n: number) => renderedReducerHook.result.current[0][n];
    const dispatchAndRerender = (param: SoundStateAction) => {
      return () => {
        dispatch(param);
        renderedReducerHook.rerender();
      }
    };
    it("reducerで変化させたsoundStateに対してEffectが反応するか", () => {
      renderedEffectHook = runRenderEffectHook();
      renderedReducerHook = runRenderReducerHook();
      expect(getSoundStates()).toHaveLength(0);
      act(dispatchAndRerender({ type: "START", payload: testTone }));
      expect(getSoundStates()).toHaveLength(1);
      expect(getSoundState(0).oscillator).toBeFalsy();
      act(() => {
        renderedEffectHook.rerender(getSoundStates());
      });
      expect(getSoundState(0).oscillator).toBeTruthy();
      act(dispatchAndRerender({ type: "STOP", payload: testTone }));
      expect(getSoundStates()).toHaveLength(1);
      expect(getSoundState(0).isEnded).toBeTruthy();
      console.log(getSoundStates());
      act(() => {
        renderedEffectHook.rerender(getSoundStates());
      });
      expect(getSoundStates()).toHaveLength(1);
      expect(getSoundState(0).oscillator).toBeFalsy();
    })

    // it("reducerで変化させたsoundStateに対してEffectが反応するか再放送", () => {
    //   renderedEffectHook = runRenderEffectHook();
    //   renderedReducerHook = runRenderReducerHook();
    //   console.log(getSoundStates());
    //   expect(getSoundStates()).toHaveLength(0);
    //   act(dispatchAndRerender({ type: "START", payload: testTone }));
    //   expect(getSoundStates()).toHaveLength(1);
    //   expect(getSoundState(0).oscillator).toBeFalsy();
    //   act(() => {
    //     renderedEffectHook.rerender(getSoundStates());
    //   });
    //   expect(getSoundState(0).oscillator).toBeTruthy();
    // })
  })
});
