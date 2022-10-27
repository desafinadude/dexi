import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';


import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export class MoveDoc extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            selectedProject: null
        }
    }

    
    onFormSubmit = (e) => {

        e.preventDefault();

        console.log(this.state);
        
        var newFormData = new FormData();

        newFormData.append("project", this.state.selectedProject);
        newFormData.append("docs", this.props.docs.map(doc => doc.id).join(','));
        newFormData.append("action", "move");

        axios.post(process.env.API + '/doc/api/', newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            console.log(response);
            this.props.onHide();
        })
        .catch((error) => {
            console.log(error);
            alert(error.message);
        })

    }

    render() {
        return (
        
        <Form onSubmit={this.onFormSubmit}>
            
            <Form.Select size="sm" onChange={(e) => this.setState({selectedProject: e.target.value})}>
                <option value="">Select Project</option>
                {this.props.projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                ))}
            </Form.Select>
        
            <Button className="mt-4" variant="primary" size="sm" type="submit">Submit</Button>
                
        </Form>

        )
    }

}