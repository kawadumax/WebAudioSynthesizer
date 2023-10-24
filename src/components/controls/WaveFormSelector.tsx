// 他のコンポーネントまたはページで

import React from 'react';
import Dropdown from '@parts/Dropdown';

const options = ["sine", "square", "sawtooth", "triangle"];

const WaveFormSelector: React.FC = () => {
    return (
        <div>
            <Dropdown options={options} />
        </div>
    );
};

export default WaveFormSelector;
