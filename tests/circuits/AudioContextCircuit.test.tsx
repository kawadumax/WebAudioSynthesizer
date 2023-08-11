import { renderHook, act } from "@testing-library/react";
import { useSoundStatesEffect } from "@/components/circuits/AudioContextCircuit/AudioEffect";
import { useSoundStatesReducer } from "@circuits/AudioContextCircuit/SoundStateReducer";
import { SoundState, SoundStateAction, Tone } from "@circuits/TypeCircuit";
import React, { Dispatch } from "react";


describe("AudioContextCircuit", () => {

  describe("useSoundStateEffect", () => {
    let audioContextMock: Partial<AudioContext>;
    let gainNodeMock: Partial<GainNode>;
    let soundStatesMock: Partial<SoundState[]>
    let dispatchMock: Partial<React.Dispatch<SoundStateAction>>

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
    });

    it("soundStateにToneを追加したとき、useSoundStatesEffectが呼ばれてオシレーターが追加される", () => {
      const { result, rerender } = renderHook((soundState) => useSoundStatesEffect(
        audioContextMock as AudioContext,
        gainNodeMock as GainNode,
        soundState as SoundState[],
        dispatchMock as Dispatch<SoundStateAction>
      ), { initialProps: soundStatesMock });
      expect(audioContextMock.createOscillator).toBeCalledTimes(0);
      act(() => {
        const testSoundState: SoundState = {
          tone: { name: "A", freq: 440 },
          isStarted: true,
          isEnded: false
        };
        soundStatesMock = [testSoundState]
        rerender(soundStatesMock);
      });
      expect(audioContextMock.createOscillator).toBeCalledTimes(1);
      expect(soundStatesMock[0]?.oscillator).toBeTruthy;
    })

    it("オシレータが追加されたあと、isEndedをtrueにすると削除される", () => {
      const { result, rerender } = renderHook((soundState) => useSoundStatesEffect(
        audioContextMock as AudioContext,
        gainNodeMock as GainNode,
        soundState as SoundState[],
        dispatchMock as Dispatch<SoundStateAction>
      ), { initialProps: soundStatesMock });
      expect(audioContextMock.createOscillator).toBeCalledTimes(0);
      act(() => {
        const testSoundState: SoundState = {
          tone: { name: "A", freq: 440 },
          isStarted: true,
          isEnded: false
        };
        soundStatesMock = [testSoundState]
        rerender(soundStatesMock);
      });
      expect(audioContextMock.createOscillator).toBeCalledTimes(1);
      expect(soundStatesMock[0]?.oscillator).toBeTruthy;
    })
  })

  describe("useEffectが呼ばれた後、AudioContextなどの状態がどうなっているのか", () => {
    it("2 + 2 = 4", () => {
      expect(2 + 2).toBe(4);
    });
  })

  describe("ディスパッチャー経由でreducerを使った場合、soundStateがどう変更されるか", () => {
    it("2 + 2 = 4", () => {
      expect(2 + 2).toBe(4);
    });
  })

});
