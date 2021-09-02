import React from 'react';
import Board from './Board.js';
import './Game.css';
import { Stack, Center, Button } from "@chakra-ui/react"


export default class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //0 for menu, 1 for checkers, 2 for chess
            //starts at menu
            window: 0
        };
    }

    renderButton(content,buttonNo) {
        return(
            <Button onClick={() => this.handleClickMenu(buttonNo)} 
                    variant="solid" 
                    background='#354e80'
                    color="whiteAlpha.900"
                    size="lg" 
                    className="menu-button"
                    isFullWidth="true"
                    fontFamily="monospace"
                    textTransform="uppercase"
                    >
                    {content}
            </Button>
        );
    }
    
    handleClickMenu(buttonNo) {
        let newWindowState = 0;
        switch(buttonNo) {
            case 0:
                newWindowState = 1;
                break;
            default:

        }
        this.setState({
            window: newWindowState
        })
    }

    render() {
        switch(this.state.window) {
            case 0:
                return (
                    <Center bg="white" className="menu-background">
                        <Stack direction="column" className="menu-outline">
                            {this.renderButton("Checkers", 0)}
                            {this.renderButton("Chess", 1)}
                        </Stack>
                    </Center>
                );
            case 1:
                return (
                    <Board className="game-section" size={[8,8]}/>
                );
            default:
        }
    }
}