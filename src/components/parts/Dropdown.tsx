// src/components/Dropdown.tsx

import React, { useState, useEffect, LiHTMLAttributes } from 'react';
import '@styles/Dropdown.scss';
import { Waveform } from '../circuits/TypeCircuit';

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
        <div className="dropdown">
            <button onClick={toggleDropdown} className="dropdown-toggle">
                Select Waveform
            </button>
            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map((option, index) => (
                        <li key={index} data-value={option} className="dropdown-item" onClick={selectOptionHandler}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
