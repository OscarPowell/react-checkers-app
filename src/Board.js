// import { extend } from 'jquery';
import React from 'react';
import './Board.css';
import red_piece from './red_piece.png';
import white_piece from './white_piece.png';


export default class Board extends React.Component {
    
    constructor(props) {
        super(props);

        this.state = {
            //this is an column array of row arrays
            squares: [1,  0,  1,  0,  1,  0,  1,  0,
                      0,  1,  0,  1,  0,  1,  0,  1, 
                      1,  0,  1,  0,  1,  0,  1,  0,
                      0,  0,  0,  0,  0,  0,  0,  0,
                      0,  0,  0,  0,  0,  0,  0,  0,
                      0, -1,  0, -1,  0, -1,  0, -1,
                      -1, 0, -1,  0, -1,  0, -1,  0,
                      0, -1,  0, -1,  0, -1,  0, -1],
            whiteIsNext: true,
            highlightMode: false
        };
    }

    handleClick(i,j) {
        const squares = this.state.squares.slice(); //slice() makes a copy so we update squares this way
        const currentVal = squares[i+j*8]
        const isWhiteNext = this.state.whiteIsNext;
        if(!this.state.highlightMode) {
            if(calculateWinner(squares) || currentVal === 0) {
                return;
            } else if(currentVal === 1 && isWhiteNext || currentVal === -1 && !isWhiteNext) {
                //handle highlighting by creating an array with the highlighted positions. Put in a function to check which squares should be highlighted.

                this.setState({
                    highlightMode: true,
                    whiteIsNext: !this.state.whiteIsNext,
                });
            }
        } else {
            if(true){//allowedmove){
                //create allowedMove(i,j) function.
            } 
            this.setState({
                highlightMode: false
            });
        }
    }
    
    //render square of index i,j according to what piece should be there
    renderSquare(i,j) {
        //1 for white, -1 for red, 0 for no piec
        let piece_image = null;

        if(this.state.squares[i + j*8] === 1) {
            piece_image = white_piece;
        } else if(this.state.squares[i + j*8] === -1) {
            piece_image = red_piece;
        }

        return (
            piece_image != null ? 
            <PSquare
            onClick={() => this.handleClick(i,j)}
            colour={(i+j) % 2 === 0 ? "white" : "black"}
            piece_image={piece_image}
            />
            :
            <Square
            onClick={() => this.handleClick(i,j)}
            colour={(i+j) % 2 === 0 ? "white" : "black"}
            />
        );
    }

    //render board of size x*y
    renderBoard(x,y) {
        let rows = []
        for(let j = 0; j < y; j++){
            rows[j] = []
            for(let i = 0; i < x; i++){
                rows[j].push(this.renderSquare(i,j));
            }
        }
        return(
            <div className="board">
                {rows}
            </div>
        );
    }
  
    render() {
        const winner = calculateWinner(this.state.squares);
        
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'white' : 'red');
        }
        return (
            <div>
                <div className="status">{status}</div>
                {this.renderBoard(this.props.size[0],this.props.size[1])}
            </div>
        );
        }
}


function Square(props){
    return (
        <button className="square"
            style={{background: props.colour}}
            onClick={props.onClick}
            >
        </button>
    );
}

function PSquare(props){
    return (
        <button className="square"
            style={{background: props.colour}}
            onClick={props.onClick}
            >
            <img className="piece" src={props.piece_image} alt="piece"/>
        </button>
    );
}


function calculateWinner(squares) {
        // const lines = [
        // [0, 1, 2],
        // [3, 4, 5],
        // [6, 7, 8],
        // [0, 3, 6],
        // [1, 4, 7],
        // [2, 5, 8],
        // [0, 4, 8],
        // [2, 4, 6],
        // ];
        // for (let i = 0; i < lines.length; i++) {
        //     const [a, b, c] = lines[i];
        //     if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        //         return squares[a];
        //     }
        // }
        return false;
}
  