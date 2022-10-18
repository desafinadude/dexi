import React from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

export class Login extends React.Component {


    constructor(){
        super();
        this.state = {
            
        }
        
    }

    componentDidMount() {
        
    }

    

    

    onFormSubmit = (e) => {

        e.preventDefault();

        let newFormData = new FormData();

        newFormData.append("username", 'admin');
        newFormData.append("password", 'admin');

        axios.post(process.env.API + '/login/', newFormData)
        .then((response) => {
            document.cookie = "dexitoken=" + response.data.token;
            window.location.href = "/doc";
        })

    }

    render() {
        return (
        <section className="bg-white vh-100">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md="4">
                        <Card className="shadow">
                            <Card.Body>
                                <h4 className="text-center mb-5">Login</h4>
                                <form onSubmit={this.onFormSubmit}>
                                    <Form.Control size="sm" type="text" placeholder="Username" name="username" className="mb-2"/>
                                    <Form.Control size="sm" type="password" placeholder="Password" name="password"/>
                                    <Button size="sm" type="submit" className="mt-3 more-rounded text-white" variant="secondary">Login</Button>
                                </form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>)
    }

}