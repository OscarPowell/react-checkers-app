import React from 'react';
import piece from './white_piece.png';
import Board from './Board.js';
import './App.css';
// import FirstComponent from './FirstComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={piece} className="App-logo" alt="logo" />
        <p className="Title">
          Checkers App (Beta)
        </p>
      </header>
      <Board className="game-section" size={[8,8]}/>
    </div>
  );
}

export default App;
