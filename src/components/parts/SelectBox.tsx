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

  const onClickHandler = (e: React.MouseEvent<HTMLLIElement>) => {
    const liTarget = e.currentTarget as HTMLLIElement;
    const input = liTarget.children[0] as HTMLInputElement;
    const v = input.value as T;
    changeLedStates(v);
    onChange(v);
  }

  useEffect(() => {
    if (initialValue !== undefined) changeLedStates(initialValue);
  }, [initialValue])

  const renderSelectItems = (options: T[]) => {
    const items = options.map((option, index) => {
      const isActive = ledStates[index].isActive;
      return (
        <li className={style.item} key={index} onClick={onClickHandler}>
          <input type="button" value={option as string} className={isActive ? style.on : style.off}></input>
          <Led isActive={isActive} />
        </li>
      )
    })
    return items;
  }

  return (
    <ul className={style.SelectBox}>
      {renderSelectItems(options)}
    </ul>
  );
}

export default SelectBox;