/** 
 * @fileoverview
 * useFXというカスタムフックを作成する
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
 * useFX - 効果の周波数と深さを制御するためのカスタムフック。
 * @returns {Object} - 現在の周波数と深さの設定、およびそれらの設定を行う関数を含むオブジェクト。
 */
const useFX = (): FXSettings & { setFrequency: (f: number) => void; setDepth: (d: number) => void; setFXSettings: (settings: FXSettings) => void; } => {
    // 周波数と深さをデフォルト値で初期化
    const [frequency, setFrequency] = useState<number>(440); // デフォルトの周波数
    const [depth, setDepth] = useState<number>(1); // デフォルトの深さ

    /**
     * setFXSettings - 周波数と深さを一度に設定する関数。
     * @param {FXSettings} settings - 新しい設定を含むオブジェクト。
     */
    const setFXSettings = ({ frequency, depth }: FXSettings) => {
        setFrequency(frequency);
        setDepth(depth);
    };

    return {
        frequency,
        depth,
        setFrequency,
        setDepth,
        setFXSettings,
    };
};

export default useFX;
