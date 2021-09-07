import React from 'react';
import './Board.css';
import red_piece from './red_piece.png';
import white_piece from './white_piece.png';
import { Button } from '@chakra-ui/react';

export default class Board extends React.Component {
    
    constructor(props) {
        super(props);

        const initialBoard =   [2,  3,  4,  5,  6,  4,  3,  2,
                                1,  1,  1,  1,  1,  1,  1,  1, 
                                0,  0,  0,  0,  0,  0,  0,  0,
                                0,  0,  0,  0,  0,  0,  0,  0,
                                0,  0,  0,  0,  0,  0,  0,  0,
                                0,  0,  0,  0,  0,  0,  0,  0,
                               -1, -1, -1, -1, -1, -1, -1, -1,
                               -2, -3, -4, -5, -6, -4, -3, -2];
        this.state = {
            //this is an column array of row arrays
            squares: initialBoard.slice(),
            movingDirection: initialBoard.slice(),
            whiteIsNext: true,
            highlightMode: false,
            highlightArray: new Array(64).fill(0),
            currentSelection: new Array(2).fill(null),
            removeSquares: new Array(64).fill([])
        };
    }

    // Functions to create highlighted moves ------------------------------------------------------
    highlightSquares(arr,i,j,jumpOne,movingDirection,removeSquares) {
        //arr is used to alter highlightArray state
        //highlightArray stored as 1D array so need this step
        const oneDIndex = i + j*8;
        //indices contains the possible locations for next move on left and right side, up or down.
        let indices = null;
        let thisMovingDir = movingDirection[oneDIndex];
        if(thisMovingDir === 1) {
            //Order: newI1Left, newJ1Left, newI2Left, newJ2Left, newI1Right, newJ1Right, newI2Right, newJ2Right
            indices = [i-1,j+1,i-2,j+2,i+1,j+1,i+2,j+2];
        } else {
            indices = [i-1,j-1,i-2,j-2,i+1,j-1,i+2,j-2];
        }
        switch(i) {
            //edge pieces can't move beyond edge in these cases. Could simplify this by only having default but it would be slower.
            case 0:
                arr = this.setHighlightStates(arr,i,j,indices[4],indices[5],indices[6],indices[7],jumpOne,movingDirection, removeSquares);
                break;
            case 7:
                arr = this.setHighlightStates(arr,i,j,indices[0],indices[1],indices[2],indices[3],jumpOne,movingDirection, removeSquares);
                break;
            default:
                arr = this.setHighlightStates(arr,i,j,indices[0],indices[1],indices[2],indices[3],jumpOne,movingDirection, removeSquares);
                arr = this.setHighlightStates(arr,i,j,indices[4],indices[5],indices[6],indices[7],jumpOne,movingDirection, removeSquares);
        }
        return arr;
    }
         
    //jumpOne tells us if it is the first jump being called, so it can use recursion.
    //movingDirectionArray lets us change the array to check for double jumps.
    //removeSquares is an array where if the current piece were to move to that position, it contains an array of pieces that should be removed (taken)
    setHighlightStates(arr,i,j,newI1,newJ1,newI2,newJ2,jumpOne,movingDirection,removeSquares) {
        //current square's moving direction
        let thisMovingDir = movingDirection[i + j*8];
        //LeapedPieceType is to check the type of the piece adjacent
        let leapedPieceType = this.state.whiteIsNext ? -1 : 1;
        //indices in the 1D array for the new positions
        let possibleIndex1 = newI1 + newJ1*8;
        let possibleIndex2 = newI2 + newJ2*8;
        //Checks that the new positions are allowed
        const withinRange1 = (possibleIndex1 < 64) && (possibleIndex1 >= 0) && (newI1 < 8) && (newI1 >= 0)
        const withinRange2 = (possibleIndex2 < 64) && (possibleIndex2 >= 0) && (newI2 < 8) && (newI2 >= 0)

        //Checks adjacent squares only for first jump. Checks if squares possible to jump to.
        if(withinRange1 && jumpOne && this.state.squares[possibleIndex1] === 0){
            arr[possibleIndex1] = 1;
        } else if(withinRange2 && this.state.squares[possibleIndex2] === 0 && this.state.squares[possibleIndex1] === leapedPieceType){
            //keep record of which to remove. If this is a multi-jump, add the removed pieces from the square this method was called from also.
            console.log(removeSquares);
            removeSquares[possibleIndex2].push(possibleIndex1);
            if(!jumpOne){
                //tries to add the additional squares to remove squares
                let prevJumpRemoveSquares = removeSquares[i+j*8];
                for(let k = 0; k < prevJumpRemoveSquares.length; k++) {
                    if(removeSquares[possibleIndex2].indexOf(prevJumpRemoveSquares[k]) === -1){
                        removeSquares[possibleIndex2].push(prevJumpRemoveSquares[k]);
                    } 
                }
            }
            arr[possibleIndex2] = 1;
            //Check if the possible indices after the next jump are within range before recursion to prevent infinite recursion
            //If they are, call highlightSquares again with new i and j as the new square moving in the same direction, the next one along.
            //have to update movingDirection otherwise highlightSquares gets confused when called again.
            //Effectively using a tree traversal recursively starting down the left branch.
            let newJ      = null;
            let newILeft  = newI2-2;
            let newIRight = newI2+2;
            switch(thisMovingDir){
                case(1): //moving down (white)
                    newJ = newJ2+2;
                    if(newJ < 8) {
                        if(newILeft >= 0 && this.state.movingDirection[newILeft + newJ*8] === 0){
                            movingDirection[newI2+8*newJ2] = thisMovingDir;
                            arr = this.highlightSquares(arr,newI2,newJ2,false,movingDirection,removeSquares);
                        }
                        if(newIRight < 8 && this.state.movingDirection[newIRight + newJ*8] === 0){
                            movingDirection[newI2+8*newJ2] = thisMovingDir;
                            arr = this.highlightSquares(arr,newI2,newJ2,false,movingDirection,removeSquares);
                        }
                    }
                    break;
                case(-1): //moving up (red)
                    newJ = newJ2-2;
                    if(newJ >= 0){
                        if(newILeft >= 0 && this.state.movingDirection[newILeft + newJ*8] === 0){
                            movingDirection[newI2+8*newJ2] = thisMovingDir;
                            arr = this.highlightSquares(arr,newI2,newJ2,false,movingDirection,removeSquares);
                        }
                        if(newIRight < 8 && this.state.movingDirection[newIRight + newJ*8] === 0){
                            movingDirection[newI2+8*newJ2] = thisMovingDir;
                            arr = this.highlightSquares(arr,newI2,newJ2,false,movingDirection,removeSquares);
                        }
                    }
                    break;
                case(2): //can move either way (kinged piece)
                    newJ = newJ2+2;
                    if(newJ < 8) {
                        if(newILeft >= 0 && this.state.movingDirection[newILeft + newJ*8] === 0){
                            movingDirection[newI2+8*newJ2] = thisMovingDir;
                            arr = this.highlightSquares(arr,newI2,newJ2,false,movingDirection,removeSquares);
                        }
                        if(newIRight < 8 && this.state.movingDirection[newIRight + newJ*8] === 0){
                            movingDirection[newI2+8*newJ2] = thisMovingDir;
                            arr = this.highlightSquares(arr,newI2,newJ2,false,movingDirection,removeSquares);
                        }
                    }
                    newJ = newJ2-2;
                    if(newJ >= 0){
                        if(newILeft >= 0 && this.state.movingDirection[newILeft + newJ*8] === 0){
                            movingDirection[newI2+8*newJ2] = thisMovingDir;
                            arr = this.highlightSquares(arr,newI2,newJ2,false,movingDirection,removeSquares);
                        }
                        if(newIRight < 8 && this.state.movingDirection[newIRight + newJ*8] === 0){
                            movingDirection[newI2+8*newJ2] = thisMovingDir;
                            arr = this.highlightSquares(arr,newI2,newJ2,false,movingDirection,removeSquares);
                        }
                    }
                    break;
                default:
            }
        }
        return arr;           
    }

    //removeSquares array contains all the squares that need removing if you move to a particular square.
    removeSquare(i,j,squares,removeSquares) {
        //i, j is the index of the new square, currentSelection is the index of old square.
        //Remove the leapfrogged square.
        console.log("Remove Squares Called");
        const oneDIndex = i+j*8;
        const squaresToRemoveIndices = removeSquares[oneDIndex];
        console.log(squaresToRemoveIndices);
        for(let k = 0; k < squaresToRemoveIndices.length ; k++){
            console.log("removing square at index " + squaresToRemoveIndices[k]);
            squares[squaresToRemoveIndices[k]] = 0;
        }
    }

    handleClick(i,j) {
        const newIndex = i+j*8;
        const squares = this.state.squares.slice();
        const movingDirection = this.state.movingDirection.slice();
        const currentVal = squares[newIndex];
        const isWhiteNext = this.state.whiteIsNext;
        //if not highlight mode, handle highlighting. If it is, handle moving the checker piece.
        if(!this.state.highlightMode) {

            if(calculateWinner(squares,true,true) || currentVal === 0) {
                console.log("winner detected")
                return;
            } else if((currentVal === 1 && isWhiteNext) || (currentVal === -1 && !isWhiteNext)) {
                //handle highlighting by creating an array with the highlighted positions. True indicates it's the first jump.
                let arr = new Array(64).fill(0);
                let removeSquares = new Array(64).fill(null);
                for(let k = 0; k<64; k++) {
                    removeSquares[k] = [];
                }
                console.log("Created removeSquares: " + removeSquares)
                let highlightArray = this.highlightSquares(arr,i,j,true,movingDirection,removeSquares);
                this.setState({
                    highlightMode: true,
                    highlightArray: highlightArray,
                    currentSelection: [i,j],
                    removeSquares: removeSquares
                });
            }
        } else {
            //check if square is highlighted from highlightArray state
            //if highlighted, change the squares state according to the square array and currentSelection state
            //change the movingSquare array to match the new positions, then switch the value to zero if it can move either way
            //right now the movingSquare matrix is just equal to the squares one.
            if(this.state.highlightArray[newIndex] === 1){
                //set old square to empty and move to other square (depends on which turn it is)
                //then reset highlight array.
                let oldIndex = this.state.currentSelection[0] + 8*this.state.currentSelection[1];
                squares[newIndex] = squares[oldIndex]
                squares[oldIndex] = 0;
                //Do the same for movingDirection list except if it reaches the end, change to kinged piece
                if((movingDirection[oldIndex] === 1 && j === 7 )|| (movingDirection[oldIndex] === -1 && j === 0)) {
                    movingDirection[newIndex] = 2;
                } else {
                    movingDirection[newIndex] = movingDirection[oldIndex];

                }
                movingDirection[oldIndex] = 0;
                //remove the leapfrogged squares. removeSquares state contains the oneD indices of squares that were leapfrogged to get to each position
                this.removeSquare(i,j,squares,this.state.removeSquares);
                this.setState({
                    squares: squares,
                    highlightArray: new Array(64).fill(0),
                    movingDirection: movingDirection,
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
        <Button className="square"
            style={{background: props.colour}}
            onClick={props.onClick}
            px="0px"
            mx="0px"
            >
        </Button>
    );
}

//Square with a piece in it
function PSquare(props){
    return (
        <Button className="square"
            style={{background: props.colour}}
            onClick={props.onClick}
            px="0px"
            mx="0px"
            >
            <img className="piece" src={props.piece_image} alt="piece"/>
        </Button>
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
  