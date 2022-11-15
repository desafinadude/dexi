import React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import { isTokenSet, getCookie } from '../utils/utils';


import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export class ProjectDetails extends React.Component {

    constructor(){
        super();
        this.state = {
            project: {}
            
        }
    }

    componentDidMount() {
        let self = this;
        
        axios.get(process.env.API + '/dexi/project/' + this.props.project.id, { headers: {
                "Authorization": "token " + getCookie('dexitoken')
        }})
        .then((response) => {
            self.setState({ project: response.data })
            

        })
        .catch((error) => {
            console.log(error);
        })


    }

    deleteExtraction = () => {
        let self = this;
        axios.delete(process.env.API + '/dexi/project/' + this.props.project.id, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
        }})
        .then((response) => {
            window.location.href = "/project";
            self.props.onHide();

        })
    }
            
    

    render() {
        return (
            <>
                <dl>
                    <dt>Name:</dt>
                    <dd>{this.state.project.name}</dd>
                    <dt>Description:</dt>
                    <dd>{this.state.project.description}</dd>
                    <dt>Docs:</dt>
                    <dd>{this.state.project.doc_count}</dd>
                    <dt>Extractions:</dt>
                    <dd>{this.state.project.extraction_count}</dd>
                    <dt>Created At:</dt>
                    <dd>{dayjs(this.state.project.created_at).format('DD-MM-YYYY')}</dd>
                </dl>
                <Button variant="danger" size="sm" onClick={this.deleteExtraction}>Delete Project</Button>
                <Button variant="primary" disabled size="sm" className="ms-1">Share Project</Button>
            </>

        )
    }

}