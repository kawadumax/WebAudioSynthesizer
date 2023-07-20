import React, { useState, useEffect } from "react";
import Knob from "@components/parts/Knob";
import Display from "@components/parts/Display";
import { useAudioContextCircuit } from "../circuits/AudioContextCircuit";

const GainKnob = () => {
  const [gain, setGain] = useState(0.5);
  const { gainNode } = useAudioContextCircuit();

  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = gain;
    }
  }, [gain, gainNode]);

  const handleGainChange = (newGain: number) => {
    if (gainNode) {
      setGain(newGain);
    }
  };

  return (
    <div className="gain-knob">
      <Knob handleValueChange={handleGainChange} defaultValue={0.5} />
      <Display parameter={gain}></Display>
    </div>
  );
};

export default GainKnob;
