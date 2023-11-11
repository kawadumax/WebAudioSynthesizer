import Led from "./Led";
import React, { useState } from "react";

interface Props<T> {
    onChange: (option: T) => void;
    options: T[];
}

// <T,>(...) の形式でジェネリック型をコンポーネントに適用
const SelectBox = <T,>({ onChange, options }: Props<T>): JSX.Element => {
    const [isActiveArray, setIsActiveArray] = useState<boolean[]>(options.map(() => false));

    const onClickHandler = (e: React.MouseEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        onChange(target.value as T);
    }

    const renderSelectItems = (options: T[]) => {
        return options.map((option, index) =>
            <React.Fragment key={index}>
                <input type="button" value={option as string} onClick={onClickHandler}></input>
                <Led isActive={isActiveArray[index]} />
            </React.Fragment>
        )
    }

    return (
        <ul>
            {renderSelectItems(options)}
        </ul>
    );
}

export default SelectBox;