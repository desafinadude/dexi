import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Badge from 'react-bootstrap/Badge';
import { isTokenSet, logout } from '../utils/utils';
import Modal from 'react-bootstrap/Modal';
import { Help } from './Help';

export class Header extends React.Component {


    constructor(){
        super();
        this.state = {
            showModal: false
        }
    }

    componentDidMount() {}

    render() {
        return (
            <>
            <Navbar fixed="top" expand="lg" bg="white" className="shadow-sm">
                <Container>
                    <Navbar.Brand href="/" className="position-relative">
                        <img width="80" src="/Dexi.png"/>
                        <div style={{fontSize: '12px', position: 'absolute', right: '-35px', top: '18px'}}><Badge pill bg="info">BETA</Badge></div>
                    </Navbar.Brand>
                    <Nav defaultActiveKey="/" className="fw-light">
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
                                    <Nav.Link href="/quick-extract">QuickExtract</Nav.Link>
                                </Nav.Item>
                                <Nav.Item className="me-3">
                                    <Nav.Link href="/project">Projects</Nav.Link>
                                </Nav.Item>
                                <Nav.Item className="me-3">
                                    <Nav.Link href="/reference">References</Nav.Link>
                                </Nav.Item>
                                <Nav.Item className="me-3">
                                    <Nav.Link onClick={() => this.setState({showModal:true})}>Help</Nav.Link>
                                </Nav.Item>
                                <NavDropdown title="User">
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={() => logout()}>Logout</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        }
                    </Nav>
                </Container>
            </Navbar>
            <Modal centered show={this.state.showModal} onHide={() => this.setState({showModal: false})} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Dexi Quick Help</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Help/>
                </Modal.Body>
            </Modal>
            </>
        )
    }

                                 
      

}