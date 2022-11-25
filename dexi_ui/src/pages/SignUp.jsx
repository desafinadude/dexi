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
            tokenSet: false,
            validated: false,
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

        e.preventDefault();

        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());

        const form = e.currentTarget;

        let errors = {
            username: [],
            email: [],
            password1: [],
            password2: []
        }

        this.setState({errors: errors});

        if(formDataObj.username.length < 3) {
            errors.username.push('Username must be at least 3 characters long');
        }

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
            errors.username.length == 0 && 
            errors.email.length == 0 && 
            errors.password1.length == 0 && 
            errors.password2.length == 0) {
                
                this.setState({validated: true}, 
                    () => {
                        this.submitForm(formDataObj)
                    }
                );
            
            } else {
                this.setState({errors: errors, validated: false});
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
                this.setState({registerSuccess: true});
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

            this.setState({errors: errors});
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
                                        <p className="text-center">You have successfully registered. Please log in <a href="/login">here</a></p>
                                    </Card.Body>
                                </Card>
                            :
                                <Card className="shadow">
                                    <Card.Body>
                                        <h4 className="text-center mb-5">Sign Up</h4>
                                        <Form onSubmit={this.onFormSubmit}>
                                            <Form.Control size="sm" type="email" placeholder="E-mail" name="email" required className={this.state.errors.email.length > 0 ? 'border-danger mt-2' : 'mt-2'}/>
                                            {this.state.errors.email.map((error,index) => <small className="text-danger" key={index}>{error}</small>)}
                                            <Form.Control size="sm" type="password" placeholder="Password" name="password1" className={this.state.errors.password1.length > 0 ? 'border-danger mt-2' : 'mt-2'} required/>
                                            {this.state.errors.password1.map((error,index) => <small className="text-danger" key={index}>{error}</small>)}
                                            <Form.Control size="sm" type="password" placeholder="Repeat Password" name="password2" className={this.state.errors.password2.length > 0 ? 'border-danger mt-2' : 'mt-2'}required/>
                                            {this.state.errors.password2.map((error,index) => <small className="text-danger" key={index}>{error}</small>)}
                                            <Button size="sm" type="submit" className="mt-3 more-rounded text-white" variant="secondary">Sign Up</Button>
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