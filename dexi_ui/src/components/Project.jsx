import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';


import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export class Project extends React.Component {

    
    onFormSubmit = (e) => {

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("name", formDataObj.name);
        newFormData.append("description", formDataObj.description);
        newFormData.append("action", "new");

        axios.post(process.env.API + '/dexi/project/', newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            this.props.onHide();
            this.props.onGetProjects();
        })
        .catch((error) => {
            console.log(error);
            alert(error.message);
        })

    }

    render() {
        return (
        
        

        <Form onSubmit={this.onFormSubmit}>
        

            <Form.Control name="name" type="text" size="sm" placeholder="Project Name" />
            <Form.Control name="description" as="textarea" rows={3} placeholder="Project Description" className="mt-2"/>
        
            <Button className="mt-4" variant="primary" size="sm" type="submit">Submit</Button>
                
        </Form>

        )
    }

}