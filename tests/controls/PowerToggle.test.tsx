import PowerToggle from "@components/controls/PowerToggle";
import AudioEngineProvider from "@circuits/AudioCircuit/AudioEngineProvider";
import { render, screen } from "@testing-library/react";

// 子コンポーネントを持つコンポーネントのテストは保留。
describe.skip("PowerToggle", () => {
  it("2 + 2 = 4", () => {
    expect(2 + 2).toBe(4);
  });

  it("can mouted", () => {
    // beginElement をモック化
    // SVGAnimateElement を window に追加
    // window.SVGAnimateElement = class SVGAnimateElement extends window.SVGElement {
    //     beginElement = jest.fn();
    // }
    render(
      <AudioEngineProvider>
        <PowerToggle></PowerToggle>
      </AudioEngineProvider>,
    );
    const labelElement = screen.getByText("Power");
    expect(labelElement).toBeInTheDocument();
  });
});
