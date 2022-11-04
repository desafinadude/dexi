import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

export class Register extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false
        }
        
    }

    componentDidMount() {
        // if(isTokenSet()) {
        //     this.setState({tokenSet: true});
        // }
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        <Card>
                            <Card.Body>
                                <Card.Title>Register</Card.Title>
                                <Card.Text>
                                    
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }
        
}