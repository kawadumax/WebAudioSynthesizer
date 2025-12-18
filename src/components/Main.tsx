import "@styles/Main.scss";
import AudioContextProvider from "@circuits/AudioCircuit/ApplicationContextProvider";
import About from "@components/About";
import Synth from "@components/Synth";

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
