import React from "react";
import logo from "@assets/logo.svg";
import "@styles/Header.scss";

const Header = () => {
  // コンポーネントの実装
  return (
    <header className="header">
      <p>
        <a href="#about">About</a>
      </p>
      <p>
        <a href="#synth">Synth</a>
      </p>
      <div className="react-logo">
        <p>Powered by</p>
        <img src={logo} alt="" />
      </div>
    </header>
  );
};

export default Header;
