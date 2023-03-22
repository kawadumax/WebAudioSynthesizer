import React from 'react';
import logo from './logo.svg';
import './Header.scss';

const Header = () => {
    // コンポーネントの実装
    return (
        <header className='header'>
            <p><a href='#'>About</a></p>
            <p><a href='#'>Synthe</a></p>
            <div className='react-logo'><p>Powered by</p><img src={logo} alt="" /></div>
        </header>
    );
  };

export default Header