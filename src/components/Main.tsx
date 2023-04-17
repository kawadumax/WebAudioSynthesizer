import React from "react";
import "@styles/Main.scss";
import Synth from "@components/Synth";
import About from "@components/About";
import AudioContextCircuit from "./circuits/AudioContextCircuit";
function Main() {
  return (
    <main>
      <AudioContextCircuit>
        <Synth></Synth>
      </AudioContextCircuit>
      <About></About>
    </main>
  );
}

export default Main;
