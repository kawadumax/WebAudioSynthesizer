import logo from "@assets/logo.svg";
import "@styles/Header.scss";

const Header = () => {
  // コンポーネントの実装
  return (
    <header className="header">
      <div className="logo">
        <h1># Web Audio Synthesizer</h1>
        <div className="react-logo">
          <small>Powered by</small>
          <img decoding="async" src={logo} alt="React" />
        </div>
      </div>
      <nav>
        <ul>
          <li><a href="#about">About</a></li>
          <li><a href="#synth">Synth</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
