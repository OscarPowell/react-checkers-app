// import { extend } from 'jquery';
import React from 'react';
import './Board.css';
import red_piece from './red_piece.png';
import white_piece from './white_piece.png';


export default class Board extends React.Component {
    
    constructor(props) {
        super(props);

        const initialBoard =   [1,  0,  1,  0,  1,  0,  1,  0,
                                0,  1,  0,  1,  0,  1,  0,  1, 
                                1,  0,  1,  0,  1,  0,  1,  0,
                                0,  0,  0,  0,  0,  0,  0,  0,
                                0,  0,  0,  0,  0,  0,  0,  0,
                                0, -1,  0, -1,  0,  -1,  0, -1,
                                -1, 0, -1,  0, -1,  0, -1,  0,
                                0, -1,  0, -1,  0, -1,  0, -1];
        this.state = {
            //this is an column array of row arrays
            squares: initialBoard.slice(),
            movingDirection: initialBoard.slice(),
            whiteIsNext: true,
            highlightMode: false,
            highlightArray: new Array(64).fill(0),
            currentSelection: new Array(2).fill(null)
        };
    }

    // Functions to create highlighted moves ------------------------------------------------------
    highlightSquares(i,j) {
        let arr = this.state.highlightArray.slice();
        const oneDIndex = i + j*8;
        //if movingDirection value is 1, we can only move it down, which is up the array.
        //if movingDirection value is -1, we can only move pieces up, which is down the array.
        let left1 = null;
        let left2 = null;
        let right1 = null;
        let right2 = null;
        let isMovingDown = this.state.movingDirection[oneDIndex] === 1;
        if(isMovingDown) {
            //note still have problems if the piece reaches the end of the board.
            left1 = i-1+(j+1)*8;
            left2 = i-2+(j+2)*8;
            right1 = i+1+(j+1)*8;
            right2 = i+2+(j+2)*8;
        } else {
            left1 = i-1+(j-1)*8;
            left2 = i-2+(j-2)*8;
            right1 = i+1+(j-1)*8;
            right2 = i+2+(j-2)*8;
        }
        switch(i) {
            case 0:
                arr = this.setHighlightStates(arr,j,right1,right2,isMovingDown);
                break;
            case 7:
                arr = this.setHighlightStates(arr,j,left1,left2,isMovingDown);
                break;
            default:
                arr = this.setHighlightStates(arr,j,left1,left2,isMovingDown);
                arr = this.setHighlightStates(arr,j,right1,right2,isMovingDown);
        }
        return arr;
    }
         
    setHighlightStates(arr,j,possibleIndex1,possibleIndex2,isMovingDown) {
        //if going down (up the array), need to check the bottom of the board edge cases, otherwise check the top ones
        let isWithinLim1 = null;
        let isWithinLim2 = null;
        let leapedPieceType = this.state.whiteIsNext ? -1 : 1;
        if(isMovingDown) {
            isWithinLim1 = j < 7;
            isWithinLim2 = j < 6;
        } else {
            isWithinLim1 = j > 0;
            isWithinLim2 = j > 1;
        }
        if(this.state.squares[possibleIndex1] === 0 && isWithinLim1){
            arr[possibleIndex1] = 1;
        } else if(this.state.squares[possibleIndex2] === 0 && this.state.squares[possibleIndex1] === leapedPieceType && isWithinLim2){
            arr[possibleIndex2] = 1;
        }
        return arr;
    }

    //------------------------------------------------------
    removeSquare(i,j,squares) {
        //i, j is the index of the new square, currentSelection is the index of old square.
        //Remove the leapfrogged square.
        const oldI = this.state.currentSelection[0];
        const oldJ = this.state.currentSelection[1];
        if(Math.abs(i - oldI) > 1 || Math.abs(j - oldJ) > 1) {
            squares[(i + oldI)/2 + 8*(j + oldJ)/2] = 0;
        }
    }

    handleClick(i,j) {
        const newIndex = i+j*8;
        const squares = this.state.squares.slice(); //slice() makes a copy so we update squares this way
        //const movingDirection = movingDirection.slice();
        const currentVal = squares[newIndex];
        const isWhiteNext = this.state.whiteIsNext;
        //if not highlight mode, handle highlighting. If it is, handle moving the checker piece.
        if(!this.state.highlightMode) {

            if(calculateWinner(squares,true,true) || currentVal === 0) {
                console.log("winner detected")
                return;
            } else if((currentVal === 1 && isWhiteNext) || (currentVal === -1 && !isWhiteNext)) {
                //handle highlighting by creating an array with the highlighted positions. Put in a function to check which squares should be highlighted.
                console.log("Correct Square");
                let highlightArray = this.highlightSquares(i,j);
                this.setState({
                    highlightMode: true,
                    highlightArray: highlightArray,
                    currentSelection: [i,j] 
                });
            }
        } else {
            //check if square is highlighted from highlightArray state
            //if highlighted, change the squares state according to the square array and currentSelection state
            //change the movingSquare array to match the new positions, then switch the value to zero if it can move either way
            //right now the movingSquare matrix is just equal to the squares one.
            if(this.state.highlightArray[newIndex] === 1){
                //set old square to empty and move to other square (depends on which turn it is)
                //then reset highlight array
                let oldIndex = this.state.currentSelection[0] + 8*this.state.currentSelection[1];
                squares[newIndex] = (squares[oldIndex] === 1) ? 1 : -1;
                squares[oldIndex] = 0;
                this.removeSquare(i,j,squares); //Code to remove the leapfrogged square
                this.setState({
                    squares: squares,
                    highlightArray: new Array(64).fill(0),
                    movingDirection: squares,
                    whiteIsNext: !this.state.whiteIsNext
                });
            } else {
                this.setState({
                    highlightArray: new Array(64).fill(0)
                });
            }
            this.setState({
                highlightMode: false
            });
        }
    }
    
    //render square of index i,j according to what piece should be there
    renderSquare(i,j) {
        //1 for white piece, -1 for red piece, 0 for no piece
        let piece_image = null;
        if(this.state.squares[i + j*8] === 1) {
            piece_image = white_piece;
        } else if(this.state.squares[i + j*8] === -1) {
            piece_image = red_piece;
        }
        //Turns green if move allowed, otherwise normal checkboard colour
        let backColour = this.state.highlightArray[i + j*8] === 1 ? "green":
                        ((i+j) % 2 === 0 ? "white" : "black")
        return (
            piece_image != null ? 
            <PSquare
            onClick={() => this.handleClick(i,j)}
            colour={backColour}
            piece_image={piece_image}
            />
            :
            <Square
            onClick={() => this.handleClick(i,j)}
            colour={backColour}
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
        const winner = calculateWinner(this.state.squares,true,true);
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.whiteIsNext ? 'white' : 'red');
        }
        return (
            <div>
                <div className="status">{status}</div>
                {this.renderBoard(this.props.size[0],this.props.size[1])}
                <div className="checkers-info">
                    <div className = "checkers-info-width">
                        <p>Winning Conditions: Either force a position where the opponent cannot make any moves,
                            or take all the opponents pieces.
                        </p>
                        <p>To get a kinged piece that can move in either direction, get a piece to the opposite
                            end of the board.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

//Empty square
function Square(props){
    return (
        <button className="square"
            style={{background: props.colour}}
            onClick={props.onClick}
            >
        </button>
    );
}

//Square with a piece in it
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


function calculateWinner(squares,canWhiteMove,canRedMove) {
        let isRedGone = false;
        let isWhiteGone = false;
        if(!squares.includes(-1)) {
            isRedGone = true;
            console.log("Red has gone!")
        } else if(!squares.includes(1)) {
            isWhiteGone = true;
            console.log("White has gone!")
        } 

        if(isRedGone || !canRedMove) {
            return 'white';
        } else if (isWhiteGone || !canWhiteMove ) {
            return 'red';
        }
        return false ;
}
  