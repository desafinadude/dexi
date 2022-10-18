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

        this.setState({status: 'submitted'});
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        Array.from(this.state.filesToUpload).forEach(file => {
            newFormData.append("file", file);
        });
        
        newFormData.append("folder", formDataObj.folder ? formDataObj.folder : 1);
        newFormData.append("action", "upload");

        axios.post(process.env.API + '/doc/api/', newFormData,{ headers: {
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
        
        

    }

    render() {

        return (
            <>
            { this.state.status === 'idle' ? 
                (
                    <Form onSubmit={this.onFormSubmit}>
                        <Form.Select size="sm" name="folder">
                        <option>Select a Folder</option>
                            <>
                                { this.props.folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                            </>
                        </Form.Select>
                        <Form.Control className="mt-4" size="sm" name="file" type="file" multiple onChange={(e) => this.showFiles(e) }/>
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