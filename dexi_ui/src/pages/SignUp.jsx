import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export class SignUp extends React.Component {


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
            <section className="vh-100">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md="4">
                        <Card className="shadow">
                            <Card.Body>
                                <h4 className="text-center mb-5">Sign Up</h4>
                                <form onSubmit={this.onFormSubmit}>
                                    <Form.Control size="sm" type="text" placeholder="E-mail" name="email" className="mb-2"/>
                                    <Form.Control size="sm" type="password" placeholder="Password" name="password" className="mb-2"/>
                                    <Form.Control size="sm" type="password" placeholder="Repeat Password" name="password"/>
                                    <Button size="sm" type="submit" className="mt-3 more-rounded text-white" variant="secondary">Sign Up</Button>
                                </form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
        );
    }
        
}