import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { isTokenSet } from '../utils/utils';

export class Header extends React.Component {


    constructor(){
        super();
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (

            <Navbar fixed="top" expand="lg" bg="white" className="shadow-sm">
                <Container>
                    <Navbar.Brand href="/">
                        <img width="80" src="/Dexi.png"/>
                    </Navbar.Brand>
                    <Nav defaultActiveKey="/" className="fw-bold">
                        { !isTokenSet() ? 
                            <>
                                <Nav.Item className="me-3">
                                    <Nav.Link href="/login">Sign In</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Button href="/signup" variant="secondary" className="more-rounded text-white">Sign Up</Button>
                                </Nav.Item>
                            </>
                        : 
                            <>
                                <Nav.Item className="me-3">
                                    <Nav.Link href="/doc">Docs</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link href="/entity">Entities</Nav.Link>
                                </Nav.Item>
                            </>
                        }
                    </Nav>
                </Container>
            </Navbar>




               
            
        )
    }

}