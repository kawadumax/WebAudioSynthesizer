import "@styles/Main.scss";
import Synth from "@components/Synth";
import About from "@components/About";
import AudioContextProvider from "@circuits/AudioCircuit/ApplicationContextProvider";
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
