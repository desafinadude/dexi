import React from 'react';
import axios from 'axios';
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

    onFormSubmit = (e) => {

        e.preventDefault();

        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("username", formDataObj.username);
        newFormData.append("email", formDataObj.email);
        newFormData.append("password1", formDataObj.password1);
        newFormData.append("password2", formDataObj.password2);

        axios.post(process.env.API + '/dj-rest-auth/registration/', newFormData)
        .then((response) => {
            if(response.status === 201) {
                document.cookie = "dexitoken=" + response.data.key;
                window.location.href = "/project";
            } else {
                alert("Something went wrong!");
            }
        })

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
                                    <Form.Control size="sm" type="text" placeholder="Username" name="username" className="mb-2"/>
                                    <Form.Control size="sm" type="email" placeholder="E-mail" name="email" className="mb-2"/>
                                    <Form.Control size="sm" type="password" placeholder="Password" name="password1" className="mb-2"/>
                                    <Form.Control size="sm" type="password" placeholder="Repeat Password" name="password2"/>
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