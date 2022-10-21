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

        if(formDataObj.folder == 'undefined'){

            alert('Please select a project to upload to.');
        
        } else {

            if(this.state.filesToUpload.length > 0 ) {

                this.setState({status: 'submitted'});
                
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
            
            } else {
                alert('Please select a file to upload.');
            }

        }
        
        

    }

    render() {

        return (
            <>
            { this.state.status === 'idle' ? 
                (
                    <>
                    {  
                        this.props.folders.length > 0 ?
                        <Form onSubmit={this.onFormSubmit}>
                            <Form.Select size="sm" name="folder">
                            <option value="undefined">Upload to Project</option>
                                <>
                                    { this.props.folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                                </>
                            </Form.Select>
                            <Form.Control className="mt-4" size="sm" name="file" type="file" multiple onChange={(e) => this.showFiles(e) } accept="application/pdf" />
                            <Button size="sm" className="mt-4" variant="primary" type="submit">Submit</Button>
                        </Form>
                        :
                        <p>No Projects found. Create one first.</p>
                    }
                    </>
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