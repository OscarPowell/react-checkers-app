// import { extend } from 'jquery';
import React from 'react';
import './Board.css';


export default class Board extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(props.size[0] * props.size[1]).fill(null),
            xIsNext: true,
        };
    }
    
    handleClick(i) {
        const squares = this.state.squares.slice(); //slice() makes a copy so we update squares this way
        if(calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            squares: squares,
            xIsNext: !this.state.xIsNext,
        });
    }
    
    //render square of index i
    renderSquare(i) {
        let colour = i % 2 === 0 ? "white-square" : "black-square"
        return (
            <Square
            value={this.state.squares[i]}
            onClick={() => this.handleClick(i)}
            squareType={colour}
            />
        );
    }

    //render a row of index j and number of squares x
    renderRow(j,x) {
        let row = []
        for(let i = 0; i < x; i++){
            row.push(this.renderSquare(i + j*x));
        }
        return (
            <div className="board-row">
                {row}
            </div>
        );
    }

    //render board of size x*y
    renderBoard(x,y) {
        let rows = []
        for(let j = 0; j < y; j++){
            rows.push(this.renderRow(j,x))
        }
        return(
            <div>
                {rows}
            </div>
        );
    }
  
    render() {
        const winner = calculateWinner(this.state.squares);
        const x = this.props.size[0] //size of board on x axis
        const y = this.props.size[1] //size of board on y axis
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        return (
            <div>
                <div className="status">{status}</div>
                {this.renderBoard(x,y)}
            </div>
        );
        }
}


function Square(props){
    return (
        <button className={props.squareType}
            onClick={props.onClick}
            >
            {props.value}
        </button>
    );
}

function calculateWinner(squares) {
        const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
}
  