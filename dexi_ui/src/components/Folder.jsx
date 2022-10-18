import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';


import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export class Folder extends React.Component {

    
    onFormSubmit = (e) => {

        

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("name", formDataObj.name);

        axios.post(process.env.API + '/folder/api', newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            window.location.href = "/folder";
        })
        .catch((error) => {
            console.log(error);
            alert(error.message);
        })

    }

    render() {
        return (
        
        <Form onSubmit={this.onFormSubmit}>
            
            <Form.Control name="name" type="text" size="sm" placeholder="Folder Name" />
        
            <Button className="mt-4" variant="primary" size="sm" type="submit">Submit</Button>
                
        </Form>

        )
    }

}