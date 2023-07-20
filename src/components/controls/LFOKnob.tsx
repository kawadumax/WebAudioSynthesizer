import React, { useState, useEffect } from "react";
import Knob from "@components/parts/Knob";
import Display from "@components/parts/Display";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit";

const LFOKnob = () => {
  const [frequency, setFrequency] = useState(0.5);
  const { gainNode } = useAudioContextCircuit();

  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = frequency;
    }
  }, [frequency, gainNode]);

  const handleLFOChange = (freq: number) => {
    if (gainNode) {
      setFrequency(freq);
    }
  };

  return (
    <div className="lfo-knob">
      <Knob handleValueChange={handleLFOChange} defaultValue={0.5} />
      <Display parameter={frequency}></Display>
    </div>
  );
};

export default LFOKnob;
