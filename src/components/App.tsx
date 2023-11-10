import React, { useEffect } from "react";
import Main from "@components/Main";
import Header from "@components/Header";
import "@styles/App.scss";

function App() {
  useEffect(() => {
    const orientation: ScreenOrientation = window.screen.orientation;
    (orientation as any).lock("landscape");

    return () => {
      orientation.unlock();
    };
  }, []);

  return (
    <div className="App">
      <Header />
      <Main />
    </div>
  );
}

export default App;
