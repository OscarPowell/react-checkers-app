import React from 'react';
import meme_aang_cutout from './meme_aang_cutout.png';
import Board from './Board.js';
import './App.css';
// import FirstComponent from './FirstComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={meme_aang_cutout} className="App-logo" alt="logo" />
        <p>
          Chequers App (Beta)
        </p>
      </header>
      <Board className="board" size={[8,8]}/>
    </div>
  );
}

export default App;
