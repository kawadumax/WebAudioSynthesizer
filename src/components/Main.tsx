import "@styles/Main.scss";
import About from "@components/About";
import Synth from "@components/Synth";
import AudioEngineProvider from "@circuits/AudioCircuit/AudioEngineProvider";

function Main() {
  return (
    <main>
      <AudioEngineProvider>
        <Synth></Synth>
      </AudioEngineProvider>
      <About></About>
    </main>
  );
}

export default Main;

