import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';


export class Upload extends React.Component {

    constructor(){
        super();
        this.state = {
            status: 'idle',
            filesToUpload: []
        }
    }

    componentDidMount() {
        this.setState({status: 'idle'});
    }

    uploadFiles = (e) => {
        console.log(e);
    }

    showFiles = (e) => {
        this.setState({filesToUpload: e.target.files});
    }

    onFormSubmit = (e) => {

        e.preventDefault();

        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());

        if(this.state.filesToUpload.length > 0 ) {

            this.setState({status: 'submitted'});
            
            var newFormData = new FormData();

            Array.from(this.state.filesToUpload).forEach(file => {
                newFormData.append("file", file);
            });
            
            newFormData.append("action", "upload");

            axios.post(process.env.API + '/dexi/project/' + this.props.project.id + '/docs', newFormData,{ headers: {
                "Authorization": "token " + getCookie('dexitoken')
                }
            })
            .then((response) => {
                this.setState({status: 'done'});
                this.props.onHide();
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
                alert(error.message);
            })
        
        } else {
            alert('Please select a file to upload.');
        }
        

    }

    render() {

        return (
            <>
            { this.state.status === 'idle' ? 
                (
                    <Form onSubmit={this.onFormSubmit}>
                        
                        <Form.Control className="mt-4" size="sm" name="file" type="file" multiple onChange={(e) => this.showFiles(e) } accept="application/pdf" />
                        <Button size="sm" className="mt-4" variant="primary" type="submit">Submit</Button>
                    </Form>
                ) : 
                this.state.status === 'submitted' ? 
                (
                    <Spinner animation="border" role="status"/>
                ) : <p>Done!</p>
            }
            </>
        )
    }

}