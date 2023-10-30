// 他のコンポーネントまたはページで

import React, { useEffect, useState } from 'react';
import Dropdown from '@parts/Dropdown';
import Display from '@parts/Display';
import styles from "@styles/WaveformSelector.module.scss";
import { useAudioContextProvider } from '../circuits/AudioContextCircuit/AudioContextProvider';
import { Waveform } from '@/modules/Type';

const options: Waveform[] = ["sine", "square", "sawtooth", "triangle"];

const WaveFormSelector: React.FC = () => {
    const { setWaveform } = useAudioContextProvider();
    const [value, setValue] = useState(options[0]);
    const changeHandler = (option: Waveform) => {
        setValue(option);
    }

    useEffect(() => {
        if (setWaveform) setWaveform(value);
    }, [value])

    return (
        <div className={styles.WaveformSelector}>
            <Dropdown options={options} onChange={changeHandler} />
            <Display parameter={value}></Display>
        </div>
    );
};

export default WaveFormSelector;
