import Led from "./Led";
import React, { useEffect, useState } from "react";
import style from "@styles/parts/SelectBox.module.scss"

interface Props<T> {
  onChange: (option: T) => void;
  options: T[];
  initialValue?: T;
}

interface LEDState<T> {
  value: T;
  isActive: boolean;
}

// <T,>(...) の形式でジェネリック型をコンポーネントに適用
const SelectBox = <T,>({ onChange, options, initialValue }: Props<T>): JSX.Element => {
  const [ledStates, setLedStates] = useState<LEDState<T>[]>(options.map((option) => { return { value: option, isActive: false } }));

  const changeLedStates = (v: T) => {
    ledStates.map((s) => {
      s.isActive = s.value === v;
      return s;
    })
    setLedStates([...ledStates]);
  }

  const onClickHandler = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const v = target.value as T;
    changeLedStates(v);
    onChange(v);
  }

  useEffect(() => {
    if (initialValue !== undefined) changeLedStates(initialValue);
  }, [])

  const renderSelectItems = (options: T[]) => {

    return options.map((option, index) => {
      const isActive = ledStates[index].isActive;
      return <li className={style.item} key={index}>
        <input type="button" value={option as string} onClick={onClickHandler} className={isActive ? style.on : style.off}></input>
        <Led isActive={isActive} />
      </li>;
    }
    )
  }

  return (
    <ul className={style.SelectBox}>
      {renderSelectItems(options)}
    </ul>
  );
}

export default SelectBox;