import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';


export class Footer extends React.Component {


    constructor(){
        super();
        this.state = {
            
        }
        
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <footer>
                <Container className="py-4">
                    <Nav className="justify-content-center">
                        <Nav.Item>
                            <Nav.Link href="/" className="link-light">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/login" className="link-light">Login</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/about" className="link-light">How it Works</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    
                    <p className="mt-3 text-center text-light">&copy; 2022 OpenUp</p>
                    
                </Container>
            </footer>
        )
    }

}