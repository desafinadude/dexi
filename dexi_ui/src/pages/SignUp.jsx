import React from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import { Link } from 'react-router-dom';

export class SignUp extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false,
            busy: false,
            errors: {
                username: [],
                email: [],
                password1: [],
                password2: []
            },
            registerSuccess: false
            
        }
    }
        

    componentDidMount() {
        // if(isTokenSet()) {
        //     this.setState({tokenSet: true});
        // }
    }

 

    onFormSubmit = (e) => {

        let self = this;

        e.preventDefault();

        self.setState({busy: true})

        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());

        const form = e.currentTarget;

        let errors = {
            email: [],
            password1: [],
            password2: []
        }

        this.setState({errors: errors});

        

        if(!formDataObj.email.includes('@')) {
            errors.email.push('Email is not valid');
        }

        if(formDataObj.password1.length < 8) {
            errors.password1.push('Password must be at least 8 characters long');
        }
        if(formDataObj.password1 != formDataObj.password2) {
            errors.password2.push('Passwords do not match');
        }
            
        if (
            errors.email.length == 0 && 
            errors.password1.length == 0 && 
            errors.password2.length == 0) {
                
                this.setState({busy: true}, 
                    () => {
                        this.submitForm(formDataObj)
                    }
                );
            
            } else {
                this.setState({errors: errors, busy: false});
            }

    }

    submitForm = (formDataObj) => {
        var newFormData = new FormData();

        newFormData.append("username", formDataObj.email);
        newFormData.append("email", formDataObj.email);
        newFormData.append("password1", formDataObj.password1);
        newFormData.append("password2", formDataObj.password2);

        axios.post(process.env.API + '/dj-rest-auth/registration/', newFormData)
        .then((response) => {
            if(response.status === 201) {
                this.setState({registerSuccess: true, busy: false});
            }
        }).catch((error) => {

            let errors = {
                email: [],
                password1: [],
                password2: []
            }
            
            if(error.response.data.email) {
                errors.email.push(error.response.data.email);
            }
            if(error.response.data.password1) {
                errors.password1.push(error.response.data.password1);
            }
            if(error.response.data.password2) {
                errors.password2.push(error.response.data.password2);
            }

            this.setState({errors: errors, busy: false});
        });
    }

    


    render() {

      

        return (
            <section className="vh-100">
                <Container className="py-5">
                    <Row className="justify-content-center">
                        <Col md="4">
                            {
                            this.state.registerSuccess ? 
                                <Card>
                                    <Card.Body>
                                        <h4 className="text-center mb-5">Success!</h4>
                                        <p className="text-center">You have successfully registered. Please log in <Link to="/login">here</Link></p>
                                    </Card.Body>
                                </Card>
                            :
                                <Card className="shadow">
                                    <Card.Body>
                                        <h4 className="text-center mb-5">Sign Up</h4>
                                        <Form onSubmit={this.onFormSubmit}>
                                            <Form.Control size="sm" type="email" placeholder="E-mail" name="email" required className={this.state.errors.email.length > 0 ? 'border-danger mt-2' : 'mt-2'} disabled={this.state.busy}/>
                                            {this.state.errors.email.map((error,index) => <small className="text-danger" key={index}>{error}</small>)}
                                            <Form.Control size="sm" type="password" placeholder="Password" name="password1" className={this.state.errors.password1.length > 0 ? 'border-danger mt-2' : 'mt-2'} required disabled={this.state.busy}/>
                                            {this.state.errors.password1.map((error,index) => <small className="text-danger" key={index}>{error}</small>)}
                                            <Form.Control size="sm" type="password" placeholder="Repeat Password" name="password2" className={this.state.errors.password2.length > 0 ? 'border-danger mt-2' : 'mt-2'}required disabled={this.state.busy}/>
                                            {this.state.errors.password2.map((error,index) => <small className="text-danger" key={index}>{error}</small>)}
                                            <Button size="sm" type="submit" className="mt-3 more-rounded text-white" variant="secondary" disabled={this.state.busy}>{this.state.busy ? 'Submitting' : 'Sign Up' }</Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
        }
                        </Col>
                    </Row>
                </Container>
            </section>
        );
    }
        
}