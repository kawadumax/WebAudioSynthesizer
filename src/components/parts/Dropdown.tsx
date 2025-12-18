// src/components/Dropdown.tsx

import style from "@styles/parts/Dropdown.module.scss";
import type React from "react";
import { useEffect, useState } from "react";
import type { Waveform } from "@/modules/Type";

interface Props {
  options: Waveform[];
  onChange: (value: Waveform) => void;
}

const Dropdown: React.FC<Props> = ({ options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const [value, setValue] = useState(options[0]);

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  const selectOptionHandler = (option: Waveform) => {
    setValue(option);
    setIsOpen(false);
  };

  return (
    <div className={style.dropdown}>
      <button type="button" onClick={toggleDropdown}>
        Select Waveform
      </button>
      {isOpen && (
        <ul>
          {options.map((option) => (
            <li key={option} data-value={option}>
              <button type="button" onClick={() => selectOptionHandler(option)}>
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
