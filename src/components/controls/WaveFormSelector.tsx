// 他のコンポーネントまたはページで

import React, { useState } from 'react';
import Dropdown from '@parts/Dropdown';
import Display from '@parts/Display';
import styles from "@styles/WaveFormSelector.module.scss";

const options = ["sine", "square", "sawtooth", "triangle"];

const WaveFormSelector: React.FC = () => {
    const [value, setValue] = useState(options[0]);
    const changeHandler = (option: string) => {
        setValue(option);
    }

    return (
        <div className={styles.WaveFormSelector}>
            <Dropdown options={options} onChange={changeHandler} />
            <Display parameter={value}></Display>
        </div>
    );
};

export default WaveFormSelector;
