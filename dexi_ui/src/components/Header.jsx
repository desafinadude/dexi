import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';
import { Help } from './Help';
import { isTokenSet } from '../utils/utils';

export class Header extends React.Component {


    constructor(){
        super();
        this.state = {
            showModal: false
        }
        
    }

    

    componentDidMount() {
        
        
    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    logout = () => {
        axios.post(process.env.API + '/dj-rest-auth/logout/')
         .then((response) => {
             document.cookie = "dexitoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
             document.cookie = "dexiuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
             window.location.href = "/";
        })
    }

    render() {
        return (
            <>
            <Navbar fixed="top" expand="lg" bg="white" className="shadow-sm">
                <Container>
                    <Navbar.Brand className="position-relative">
                        <Link to="/">
                            <img width="80" src="/Dexi.png"/>
                            <div style={{fontSize: '12px', position: 'absolute', right: '-35px', top: '18px'}}><Badge pill bg="info">BETA</Badge></div>
                        </Link>
                    </Navbar.Brand>
                    <Nav defaultActiveKey="/" className="fw-light">
                        { !isTokenSet() ? 
                            <>
                                <Nav.Item className="me-3">
                                    <Link className="nav-link" to="/login">Sign In</Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Link to="/signup"><Button variant="secondary" className="more-rounded text-white">Sign Up</Button></Link>
                                </Nav.Item>
                            </>
                        : 
                            <>
                                <Nav.Item className="me-3">
                                    <Link className="nav-link" to="/quick-extract">QuickExtract</Link>
                                </Nav.Item>
                                <Nav.Item className="me-3">
                                    <Link className="nav-link" to="/project">Projects</Link>
                                </Nav.Item>
                                <Nav.Item className="me-3">
                                    <Link className="nav-link" to="/reference">References</Link>
                                </Nav.Item>
                                <Nav.Item className="me-3">
                                    <Nav.Link onClick={() => this.setState({showModal:true})}>Help</Nav.Link>
                                </Nav.Item>
                                <NavDropdown title="User">
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={() => this.logout()}>Logout</NavDropdown.Item>
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