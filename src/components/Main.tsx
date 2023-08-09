import React from "react";
import "@styles/Main.scss";
import Synth from "@components/Synth";
import About from "@components/About";
import AudioContextProvider from "@circuits/AudioContextCircuit/AudioContextProvider";
function Main() {
  return (
    <main>
      <AudioContextProvider>
        <Synth></Synth>
      </AudioContextProvider>
      <About></About>
    </main>
  );
}

export default Main;
