// src/components/Dropdown.tsx

import React, { useState, useEffect, LiHTMLAttributes } from 'react';
import style from '@styles/Dropdown.module.scss';
import { Waveform } from '@/modules/Type';

interface Props {
    options: Waveform[];
    onChange: (value: Waveform) => void;
}

const Dropdown: React.FC<Props> = ({
    options,
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);
    const [value, setValue] = useState(options[0]);

    useEffect(() => {
        onChange(value);
    }, [value]);

    const selectOptionHandler = (e: React.MouseEvent<HTMLLIElement>) => {
        setValue(e.currentTarget.getAttribute("data-value") as Waveform);
    }

    return (
        <div className={style.dropdown}>
            <button onClick={toggleDropdown}>
                Select Waveform
            </button>
            {isOpen && (
                <ul>
                    {options.map((option, index) => (
                        <li key={index} data-value={option} onClick={selectOptionHandler}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
