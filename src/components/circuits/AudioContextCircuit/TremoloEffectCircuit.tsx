/** 
 * @fileoverview
 * useTremoloEffectというカスタムフックを作成する
 * このフックでは frequencyとdepthを設定できる関数を提供する
 **/

import { useState } from 'react';

/**
 * FXSettings - 周波数と深さの設定を表現する型。
 * @interface FXSettings
 * @property {number} frequency - 効果の周波数。
 * @property {number} depth - 効果の深さ。
 */
interface FXSettings {
  frequency: number;
  depth: number;
}

/**
 * useTremoloEffect - 効果の周波数と深さを制御するためのカスタムフック。
 * @returns {Object} - 現在の周波数と深さの設定、およびそれらの設定を行う関数を含むオブジェクト。
 */
const useTremoloEffect = (audioContext: AudioContext | null, amplitude: GainNode | null) => {
  if (!audioContext || !amplitude) {
    return null;
  }

  const lfo = audioContext.createOscillator();
  const depth = audioContext.createGain();

  lfo.frequency.value = 1;
  depth.gain.value = 0.5;
  lfo.connect(depth);
  depth.connect(amplitude.gain);
  lfo.start();

  return { depth, lfo };
};

export default useTremoloEffect;
