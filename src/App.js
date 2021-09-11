import React from 'react';
import piece from './white_piece.png';
import Game from './Game.js';
import './App.css'; 

export default class App extends React.Component{
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={piece} className="App-logo" alt="logo" />
          <p className="Title">
            Play Game - O. Powell(Beta)
          </p>
        </header>
        <Game className="game"/>
      </div>
    )
  }
}
