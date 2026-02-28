import style from "@styles/parts/SelectBox.module.scss";
import { type ReactElement, useCallback, useEffect, useState } from "react";
import Led from "./Led";

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
const SelectBox = <T,>({
  onChange,
  options,
  initialValue,
}: Props<T>): ReactElement => {
  const [ledStates, setLedStates] = useState<LEDState<T>[]>(
    options.map((option) => {
      return { value: option, isActive: false };
    }),
  );

  const changeLedStates = useCallback((selected: T) => {
    setLedStates((prev) =>
      prev.map((state) => ({
        ...state,
        isActive: state.value === selected,
      })),
    );
  }, []);

  const handleSelect = useCallback(
    (value: T) => {
      changeLedStates(value);
      onChange(value);
    },
    [changeLedStates, onChange],
  );

  useEffect(() => {
    if (initialValue !== undefined) changeLedStates(initialValue);
  }, [initialValue, changeLedStates]);

  const renderSelectItems = (options: T[]) => {
    const items = options.map((option, index) => {
      const isActive = ledStates[index].isActive;
      return (
        <li className={style.item} key={String(option)}>
          <input
            type="button"
            value={option as string}
            className={isActive ? style.on : style.off}
            onClick={() => handleSelect(option)}
          ></input>
          <Led isActive={isActive} />
        </li>
      );
    });
    return items;
  };

  return <ul className={style.SelectBox}>{renderSelectItems(options)}</ul>;
};

export default SelectBox;
