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

  const selectOptionHandler = (e: React.MouseEvent<HTMLLIElement>) => {
    setValue(e.currentTarget.getAttribute("data-value") as Waveform);
  };

  return (
    <div className={style.dropdown}>
      <button onClick={toggleDropdown}>Select Waveform</button>
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
