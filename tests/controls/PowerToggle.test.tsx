import React from "react";
import { render, screen } from "@testing-library/react";
import PowerToggle from "@components/controls/PowerToggle";

describe("PowerToggle", () => {
    it("2 + 2 = 4", () => {
        expect(2 + 2).toBe(4);
    });

    xit("can mouted", () => {
        const onPower = (isToggled: boolean) => {
            console.log(isToggled);
        }
        // beginElement をモック化
        // SVGAnimateElement を window に追加
        window.SVGAnimateElement = class SVGAnimateElement extends window.SVGElement {
            beginElement = jest.fn();
        }
        render(<PowerToggle onPower={onPower}></PowerToggle>);
        const labelElement = screen.getByText("Power");
        expect(labelElement).toBeInTheDocument();
    })
});