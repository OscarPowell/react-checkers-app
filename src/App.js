import React, {Component} from 'react';
import meme_aang_cutout from './meme_aang_cutout.png';
import './App.css';
import FirstComponent from './FirstComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={meme_aang_cutout} className="App-logo" alt="logo" />
        <p>
          Hello Mira
        </p>
        
      </header>
      {/* <FirstComponent displaytext="First Component Data"/> */}
    </div>
  );
}

export default App;
