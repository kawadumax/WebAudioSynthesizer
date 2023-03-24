import React, { useState, useEffect } from "react";
import Knob from "@components/parts/Knob";

interface Props {
  audioContext: AudioContext;
}

const GainKnob = ({ audioContext }: Props) => {
  const [gain, setGain] = useState<number>(0);

  const gainNode = audioContext.createGain();
  gainNode.gain.value = gain;

  useEffect(() => {
    gainNode.gain.value = gain;
  }, [gain, gainNode.gain]);

  const handleGainChange = (newGain: number) => {
    setGain(newGain);
  };

  return (
    <div className="gain-knob">
      <Knob handleValueChange={handleGainChange} />
    </div>
  );
};

export default GainKnob;
