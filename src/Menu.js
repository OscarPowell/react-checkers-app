import React from 'react';
import './Menu.css';
import {Stack, Center, Button } from "@chakra-ui/react"

export default class Menu extends React.Component {

    renderButton(content,buttonNo) {
        return(
            <Button onClick={this.props.onClick} 
                    variant="solid" 
                    colorScheme="blue"
                    size="lg" 
                    className="menu-button"
                    isFullWidth="true"
                    >
                    {content}
            </Button>
        );
    }

    render() {
        return  (
            <Center bg="white" h="500 px" className="menu-background">
                <Stack direction="column" className="menu-outline">
                    {this.renderButton("Checkers", 0)}
                    {this.renderButton("Chess", 1)}
                </Stack>
            </Center>
        );
    }
}

