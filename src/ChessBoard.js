import React from 'react';
import './Board.css';
import './chess.css';
import black_king from './chess_pieces/black_king.png';
import black_queen from './chess_pieces/black_queen.png';
import black_pawn from './chess_pieces/black_pawn.png';
import black_bishop from './chess_pieces/black_bishop.png';
import black_knight from './chess_pieces/black_knight.png';
import black_rook from './chess_pieces/black_rook.png';
import white_king from './chess_pieces/white_king.png';
import white_queen from './chess_pieces/white_queen.png';
import white_pawn from './chess_pieces/white_pawn.png';
import white_bishop from './chess_pieces/white_bishop.png';
import white_knight from './chess_pieces/white_knight.png';
import white_rook from './chess_pieces/white_rook.png';


import { Button } from '@chakra-ui/react';

export default class Board extends React.Component {
    
    constructor(props) {
        super(props);

        const initialBoard =   [2,  3,  4,  6,  5,  4,  3,  2,
                                1,  1,  1,  1,  1,  1,  1,  1, 
                                0,  0,  0,  0,  0,  0,  0,  0,
                                0,  0,  0,  0,  0,  0,  0,  0,
                                0,  0,  0,  0,  0,  0,  0,  0,
                                0,  0,  0,  0,  0,  0,  0,  0,
                               -1, -1, -1, -1, -1, -1, -1, -1,
                               -2, -3, -4, -6, -5, -4, -3, -2];

        const firstMoveInitial =[1,  0,  0,  1,  0,  0,  0,  1,
                                 1,  1,  1,  1,  1,  1,  1,  1, 
                                 0,  0,  0,  0,  0,  0,  0,  0,
                                 0,  0,  0,  0,  0,  0,  0,  0,
                                 0,  0,  0,  0,  0,  0,  0,  0,
                                 0,  0,  0,  0,  0,  0,  0,  0,
                                 1,  1,  1,  1,  1,  1,  1,  1,
                                 1,  0,  0,  1,  0,  0,  0,  1];
        this.state = {
            //maintains the piece positions and types
            squares: initialBoard.slice(),
            //used to distinguish pieces that have first move effects
            firstMoveArr: firstMoveInitial.slice(),
            //keeps track of turn
            isWhiteNext: true,
            //used to set highlight mode on first click of piece
            highlightMode: false,
            //used to show which moves are possible
            highlightArray: new Array(64).fill(0),
            //current piece selected on first click of piece
            currentSelection: new Array(2).fill(null),
            //check for en passant. 1 in indicates a double moved pawn has just moved there, otherwise it indicates the index of the piece to remove by en passant
            enPassantArr: new Array(64).fill(0),
            //location of the white and black kings, used for checking if moving a piece creates check
            whiteKingIndex: 3,
            blackKingIndex: 59
        };
    }

    //highlight possible moves ------------------------------------------------------
    //isCheckTest is used to check for Check and Checkmate by not actually highlighting moves but checking possible moves. Doesn't check the moves for the opponents king, also doesn't check if the pieces causing the check can't move due to being pinned to the king, as that's still check.
    //squaresState is passed this.state.squares in the handleClick(), but in the check test we want to remove the current king selected
    highlightSquares(squaresState,arr,i,j,firstMoveArr,isCheckTest) {
        //arr is used to alter highlightArray state
        //highlightArray stored as 1D array so need this step
        const oneDIndex = i + j*8;
        let isFirstMove = firstMoveArr[oneDIndex] === 1;
        let thisPiece = squaresState[oneDIndex];
        let enPassantArr = this.state.enPassantArr.slice();


        //define functions in ES6 syntax so we can use "this" binding. Self explanatory function names
        let squareHasCurrentTeamPiece =  (index) => {
            if(this.state.isWhiteNext){
                return squaresState[index] > 0;
            } else{
                return squaresState[index] < 0;
            }
        }
        let squareHasOpponentPiece =  (index) => {
            //used for checking if the current team's king is in danger
            if(isCheckTest) { 
                return squaresState[index] !== 0;
            } else {
                if(this.state.isWhiteNext){
                    return squaresState[index] < 0;
                } else{
                    return squaresState[index] > 0;
                }
            }
        }
        let squareEmpty =  (index) => {
            return squaresState[index] === 0;
        }
        let squareHasDoubleMovedPawn = (index) => { //used for en passant
            return enPassantArr[index] === 1;
        }
        //During the check for the pieces around the king, we look at all pieces except the opposing and current king. We need the opposing king for checking if moving other pieces causes check though.
        //We allow the remove and adding of pieces to test certain states of the board for check
        let squareNotInCheck = (index,isKingCheck,removeIndex,addIndex) => {
            let squares = squaresState.slice();
            if(isKingCheck) {
                //need to remove this colour's king from squares so it doesn't block the squares behind it
                for(let k = 0; k < squares.length; k++){
                    if((squares[k] === 6 && this.state.isWhiteNext) || (squares[k] === -6 && !this.state.isWhiteNext)){
                        squares[k] = 0
                    }
                }
            }
            //remove the piece at the index kingNotInCheck called from, so that we can check that moving the piece doesn't cause check if this function is called by kingNotInCheck
            //need to remove this colour's king from squares so it doesn't block the squares behind it
            //If we are checking a move for stopping check, need to move the piece to that position to check the new state
            if(addIndex !== null && removeIndex !== null){
                squares[addIndex] = squares[removeIndex];
            }
            if(removeIndex !== null){
                squares[removeIndex] = 0;
            }
            console.log(squares);
            
            let testArr = new Array(64).fill(0);
            let firstMoveArr = this.state.firstMoveArr.slice();
            //iterate through whole board to check if any opponent piece can move to 
            for(let k = 0; k < 8; k++){
                for(let l = 0; l < 8; l++){
                    if(squares[k+l*8] !== 0){
                        //true to indicate it's just to test which pieces can move.
                        testArr = this.highlightSquares(squares,testArr,k,l,firstMoveArr,true);
                    }
                }
            }
            return testArr[index] === 0;
        }
        //when checking if a move doesn't cause check, it uses the original index of the piece and then the new index being tried by the piece
        let kingNotInCheck = (originalIndex,moveToIndex) => {
            let result = null;
            if(this.state.isWhiteNext) {
                result = squareNotInCheck(this.state.whiteKingIndex,false,originalIndex,moveToIndex);
            } else {
                result = squareNotInCheck(this.state.blackKingIndex,false,originalIndex,moveToIndex);
            }
            if(!result) {
                console.log("Can't move as this puts the king in check!")
            }
            return result;
        }
        let squareHasNoAdjacentKing = (iIndex,jIndex) => { //used to check for king's moves
            let squares = squaresState.slice();
            let iIndices = [iIndex,iIndex+1,iIndex+1,iIndex+1,iIndex,iIndex-1,iIndex-1,iIndex-1];
            let jIndices = [jIndex+1,jIndex+1,jIndex,jIndex-1,jIndex-1,jIndex-1,jIndex,jIndex+1];
            let result = true;
            for(let k = 0; k < 8; k++){
                if(iIndices[k] <= 7 && iIndices[k] >= 0 && jIndices[k] <= 7 && jIndices[k] >= 0) {
                    if((squares[iIndices[k] + jIndices[k]*8] === -6 && this.state.isWhiteNext) || (squares[iIndices[k] + jIndices[k]*8] === 6 && !this.state.isWhiteNext)){
                        result = false;
                    }
                }
            }
            return result;
        }
        //NEED TO ADD: Check if the pieces moving puts the king into check

        //During the Check/Checkmate test, we only want to check pieces of the opponent so skip the whole function if it's a piece of the current team.
        if(isCheckTest && ((squaresState[oneDIndex] > 0 && this.state.isWhiteNext) || (squaresState[oneDIndex] < 0 && !this.state.isWhiteNext))){
            return arr;
        }

        //get the piece type to determine moves
        switch(Math.abs(thisPiece)){
            case 1:
                //pawns
                checkPawnMoves(isFirstMove);
                break;
            case 2:
                //rooks
                checkRowAndColsMoves();
                //Need to add - check for castling
                break;
            case 3:
                //knights
                checkKnightMoves();
                break;
            case 4:
                //bishops
                checkDiagMoves();
                break;
            case 5:
                //queens
                checkDiagMoves();
                checkRowAndColsMoves();
                break;
            case 6:
                //king
                if(!isCheckTest) {
                    checkKingMoves(isFirstMove);
                }
                break;
            default:
                //no default, just to avoid warning message
        }
        return arr;

        function checkPawnMoves(isFirstMove) {
            let index = null;
            switch(thisPiece){
                case(1):
                    if(i > 0 && j < 7){
                        index = i-1 + (j+1)*8;
                        //Second part is to make sure the move causes the king to no be in check under highlightSquares, or if it's a checkTest we don't need to check this.
                        if(squareHasOpponentPiece(index) && ( (!isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[index] = 1;
                        }
                    }
                    if(i < 7 && j < 7){
                        index = i+1 + (j+1)*8;
                        if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[index] = 1;
                        }
                    }
                    //don't need the pawns forward moves during the test as it can't take these positions
                    if(j < 7 && !isCheckTest){
                        index = i + (j+1)*8;
                        if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[index] = 1
                        }
                    }
                    if(isFirstMove && !isCheckTest) {
                        //double move forward
                        index = i + (j+2)*8;
                        if(squareEmpty(index) && squareEmpty(i + (j+1)*8) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[index] = 1
                        }
                    } 
                    //check for possible en passant
                    if(i < 7) {
                        index = i+1 + j*8;
                        if(squareHasDoubleMovedPawn(index) && squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[i+1+(j+1)*8] = 1;
                        }
                    }
                    if(i > 0){
                        index = i-1 + j*8;
                        if(squareHasDoubleMovedPawn(index) && squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[i-1+(j+1)*8] = 1;
                        }
                    }
                    break;
                case(-1):
                    if(i-1 >= 0 && j >= 0){
                        index = i-1 + (j-1)*8;
                        if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[index] = 1;
                        }
                    }
                    if(i+1 < 7 && j >= 0){
                        index = i+1 + (j-1)*8;
                        if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[index] = 1;
                        }
                    }
                    //don't need the pawns forward moves during the test as it can't take these positions
                    if(j>=0 && !isCheckTest){
                        index = i + (j-1)*8;
                        if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[index] = 1
                        }
                    }
                    if(isFirstMove && !isCheckTest) {
                        //double move forward
                        index = i + (j-2)*8;
                        if(squareEmpty(index) && squareEmpty(i + (j-1)*8) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[index] = 1
                        } 
                    } 
                    //Check for possible en passant
                    if(i < 7) {
                        index = i+1 + j*8;
                        if(squareHasDoubleMovedPawn(index) && squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[i+1+(j-1)*8] = 1;
                        }
                    }
                    if(i > 0){
                        index = i-1 + j*8;
                        if(squareHasDoubleMovedPawn(index) && squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)){
                            arr[i-1+(j-1)*8] = 1;
                        }
                    }
                    break;
                default:
                    //to avoid warnings
            }

        }

        function checkRowAndColsMoves() {
            let index = null;
            //check rows to the right
            for(let k = 0; k <= 7-i; k++){
                if(k !== 0 && i+k <= 7) {
                    index = i+k + j*8;
                    if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                    if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                        break;
                    }
                    if(squareHasCurrentTeamPiece(index)) {
                        break;
                    }
                }
            }
            //check rows to the left
            for(let k = 0; k <= i; k++){
                if(k !== 0 && i-k >= 0) {
                    index = i-k + j*8;
                    if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                    if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                        break;
                    }
                    if(squareHasCurrentTeamPiece(index)) {
                        break;
                    }
                }
            }
            //check column upwards
            for(let k = 0; k <= j; k++){
                if(k !== 0 && j-k >= 0) {
                    index = i +(j-k)*8;
                    if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                    if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                        break;
                    }
                    if(squareHasCurrentTeamPiece(index)) {
                        break;
                    }
                }
            }
            //check column downwards
            for(let k = 0; k <= 7-j; k++){
                if(k !== 0 && j+k < 8) {
                    index = i +(j+k)*8;
                    if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                    if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                        break;
                    }
                    if(squareHasCurrentTeamPiece(index)) {
                        break;
                    }
                }
            }
        }

        function checkDiagMoves() {
            let index = null;
            //Check diagonal up and left
            for(let k = 0; k <= Math.min(i,j); k++){
                if(k !== 0 && j-k >= 0 && i-k >= 0) {
                    index = i-k +(j-k)*8;
                    if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                    if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                        break;
                    }
                    if(squareHasCurrentTeamPiece(index)) {
                        break;
                    }
                }
            }
            //Check diagonal up and right
            for(let k = 0; k <= Math.min(7-i,j); k++){
                if(k !== 0 && j-k >= 0 && i+k <= 7) {
                    index = i+k +(j-k)*8;
                    if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                    if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                        break;
                    }
                    if(squareHasCurrentTeamPiece(index)) {
                        break;
                    }
                }   
            }   
            //Check diagonal down and right
            for(let k = 0; k <= Math.min(7-i,7-j); k++){
                if(k !== 0 && j+k <= 7 && i+k <= 7) {
                    index = i+k +(j+k)*8;
                    if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                    if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                        break;
                    }
                    if(squareHasCurrentTeamPiece(index)) {
                        break;
                    }
                }   
            } 
            //Check diagonal down and left
            for(let k = 0; k <= Math.min(i,7-j); k++){
                if(k !== 0 && j+k <= 7 && i-k >= 0) {
                    index = i-k +(j+k)*8;
                    if(squareEmpty(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                    if(squareHasOpponentPiece(index) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                        break;
                    }
                    if(squareHasCurrentTeamPiece(index)) {
                        break;
                    }
                }   
            } 
        }

        function checkKnightMoves() {
            //listing the possible move indices starting from top right and going round clockwise
            let iIndices = [i+1,i+2,i+2,i+1,i-1,i-2,i-2,i-1];
            let jIndices = [j+2,j+1,j-1,j-2,j-2,j-1,j+1,j+2];
            let index = null;
            for(let k = 0; k < 8; k++){
                if(iIndices[k] <= 7 && iIndices[k] >= 0 && jIndices[k] <= 7 && jIndices[k] >= 0) {
                    index = iIndices[k] + jIndices[k] * 8;
                    if((squareEmpty(index) || squareHasOpponentPiece(index)) && (( !isCheckTest && kingNotInCheck(i+j*8,index)) || isCheckTest)) {
                        arr[index] = 1;
                    }
                }
            }
        }

        function checkKingMoves(isFirstMove) {
            //listing the possible move indices starting from top and going round clockwise
            let iIndices = [i,i+1,i+1,i+1,i,i-1,i-1,i-1];
            let jIndices = [j+1,j+1,j,j-1,j-1,j-1,j,j+1];
            let index = null;
            for(let k = 0; k < 8; k++){
                if(iIndices[k] <= 7 && iIndices[k] >= 0 && jIndices[k] <= 7 && jIndices[k] >= 0) {
                    index = iIndices[k] + jIndices[k] * 8;
                    if((squareEmpty(index) || squareHasOpponentPiece(index)) && squareNotInCheck(index,true,null) && squareHasNoAdjacentKing(iIndices[k],jIndices[k])) {
                        arr[index] = 1;
                    }
                }
            }
            //Need to add - check for castling
        }
    }

    handleClick(i,j) {
        const newIndex = i+j*8;
        const squares = this.state.squares.slice();
        const firstMoveArr = this.state.firstMoveArr.slice();
        const currentVal = squares[newIndex];
        const isWhiteNext = this.state.isWhiteNext;
        let enPassantArr = this.state.enPassantArr.slice();
        //if not highlight mode, handle highlighting. If it is, handle moving the checker piece.
        if(!this.state.highlightMode || (this.state.highlightMode && this.state.highlightArray[newIndex] === 0 && this.state.squares[newIndex] !== 0)) {
            //NEED TO ADD : Check if the king is in check before allowing other pieces to be clicked

            if(calculateWinner(squares,true,true) || currentVal === 0) {
                console.log("winner detected");
                return;
            } else if((currentVal > 0 && isWhiteNext) || (currentVal < 0 && !isWhiteNext)) {
                //handle highlighting by creating an array with the highlighted positions.
                let arr = new Array(64).fill(0);
                let highlightArray = this.highlightSquares(squares,arr,i,j,firstMoveArr,false); //false indicates this call is for actual highlighting rather than as a test
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
                //then reset highlight array.
                let oldIndex = this.state.currentSelection[0] + 8*this.state.currentSelection[1];
                //check if en passant should cause the removal of a piece. Pawns can only move diagonally into a empty space under an en passant move.
                if(squares[newIndex] === 0 && squares[oldIndex] === 1 && Math.abs(this.state.currentSelection[0]-i) === 1 && Math.abs(this.state.currentSelection[1]-j) === 1){
                    squares[i + (j-1)*8] = 0;
                } else if(squares[newIndex] === 0 && squares[oldIndex] === -1 && Math.abs(this.state.currentSelection[0]-i) === 1 && Math.abs(this.state.currentSelection[1]-j) === 1){
                    squares[i + (j+1)*8] = 0;
                } 
                squares[newIndex] = squares[oldIndex];
                squares[oldIndex] = 0;

                //Keep track of en passant opportunities for next turn
                enPassantArr = new Array(64).fill(0);
                if(i === this.state.currentSelection[0] && Math.abs(j-this.state.currentSelection[1]) === 2){
                    enPassantArr[newIndex] = 1;
                }

                //Do the same for firstMoveArr list except if it reaches the end, change pawn to a piece of players choosing
                //NEED TO IMPLEMENT ________-----------------------------------------------------------------------------------------------------------------------------------------------
                // if((firstMoveArr[oldIndex] === 1 && j === 7 )|| (firstMoveArr[oldIndex] === -1 && j === 0)) {
                //     firstMoveArr[newIndex] = 0;
                // } else {
                // firstMoveArr[newIndex] = firstMoveArr[oldIndex];
                // }
                //Set firstMoveArr values to zero if it has moved
                firstMoveArr[oldIndex] = 0;
                firstMoveArr[newIndex] = 0;

                this.setState({
                    squares: squares,
                    highlightArray: new Array(64).fill(0),
                    firstMoveArr: firstMoveArr,
                    isWhiteNext: !this.state.isWhiteNext,
                    enPassantArr: enPassantArr
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
        //Place correct pieces onto the squares using this.state.squares
        let piece_image = null;
        switch(this.state.squares[i + j*8]) {
            case(-6):
                piece_image = black_king;
                break;
            case(-5):
                piece_image = black_queen;
                break;
            case(-4):
                piece_image = black_bishop;
                break;
            case(-3):
                piece_image = black_knight;
                break;
            case(-2):
                piece_image = black_rook;
                break;
            case(-1):
                piece_image = black_pawn;
                break;
            case( 6):
                piece_image = white_king;
                break;
            case( 5):
                piece_image = white_queen;
                break;
            case( 4):
                piece_image = white_bishop;
                break;
            case( 3):
                piece_image = white_knight;
                break;
            case( 2):
                piece_image = white_rook;
                break;
            case( 1):
                piece_image = white_pawn;
                break;        
            default:
                //no default, just to avoid warning message
        }
        //Turns green if move allowed, otherwise normal checkboard colour
        let backColour = this.state.highlightArray[i + j*8] === 1 ? "green":
                        ((i+j) % 2 === 0 ? "white" : "#793131")
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
            status = 'Next player: ' + (this.state.isWhiteNext ? 'white' : 'black');
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
            height="5vw"
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
            height="5vw"
            >
            <img className="piece" src={props.piece_image} alt="piece"/>
        </Button>
    );
}


function calculateWinner(squares,canWhiteMove,canBlackMove) {
    let isBlackGone = false;
    let isWhiteGone = false;
    if(!squares.includes(-1)) {
        isBlackGone = true;
    } else if(!squares.includes(1)) {
        isWhiteGone = true;
    } 

    if(isBlackGone || !canBlackMove) {
        return 'white';
    } else if (isWhiteGone || !canWhiteMove ) {
        return 'black';
    }
    return false ;
}
  