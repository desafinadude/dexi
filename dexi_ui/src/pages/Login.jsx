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
            valid: true,
            error: '',
            busy: false
        }
        
    }

    componentDidMount() {
        
    }

    

    

    onFormSubmit = (e) => {

        let self = this;

        e.preventDefault();

        self.setState({busy: true});

        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("username", formDataObj.username);
        newFormData.append("password", formDataObj.password);

        axios.post(process.env.API + '/dj-rest-auth/login/', newFormData)
        .then((response) => {
            document.cookie = "dexitoken=" + response.data.key;
            window.location.href = "/project";
        }).catch((error) => {
            this.setState({valid: false, error: error.response.data.non_field_errors[0], busy: false});
        });

    }

    render() {
        return (
        <section className="vh-100">
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md="4">
                        <Card className="shadow">
                            <Card.Body>
                                <h4 className="text-center mb-5">Login</h4>
                                <form onSubmit={this.onFormSubmit}>
                                    <Form.Control size="sm" type="text" placeholder="E-mail" name="username" className="mb-2" required disabled={this.state.busy}/>
                                    <Form.Control size="sm" type="password" placeholder="Password" name="password" required disabled={this.state.busy}/>
                                    {!this.state.valid && <small className="mt-3 text-danger d-block">{this.state.error}</small>}
                                    <Button size="sm" type="submit" className="mt-3 more-rounded text-white" variant="secondary" disabled={this.state.busy}>{this.state.busy ? 'Submitting' : 'Login' }</Button>
                                </form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>)
    }

}