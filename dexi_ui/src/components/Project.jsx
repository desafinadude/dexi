import React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import { isTokenSet, getCookie } from '../utils/utils';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';


export class Project extends React.Component {

    constructor(){
        super();
        this.state = {
            project: {
                name: '',
                description: ''
                // users: []
            }
        },
        this.addUserControl = React.createRef();
    }

    componentDidMount() {
        let self = this;

        if(self.props.selectedProject) {

            axios.get(process.env.API + '/dexi/project/' + this.props.selectedProject, { headers: {
                "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                let project = response.data;
                self.setState({ project: project })
                

            })
            .catch((error) => {
                console.log(error);
            })
        
        }


    }

    deleteProject = () => {
        let self = this;
        axios.delete(process.env.API + '/dexi/project/' + this.props.selectedProject, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
        }})
        .then((response) => {
            window.location.href = "/project";
            self.props.onHide();

        })
    }
    
    onFormSubmit = (e) => {

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("name", formDataObj.name);
        newFormData.append("description", formDataObj.description);

        if(this.props.selectedProject) {

            axios.put(process.env.API + '/dexi/project/' + this.props.selectedProject, newFormData, { headers: {
                "Authorization": "token " + getCookie('dexitoken')
                }
            })
            .then((response) => {
                this.props.onHide();
                this.props.onGetProject();
                
            })
            .catch((error) => {
                console.log(error);            
            })
        
        } else {

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
            })
        }

    }

    onChange(e, field) {
        let self = this;
        let project = self.state.project;
        project[field] = e.target.value;
        this.setState({ project: project });
    }

    render() {
        return (
        
        
            
        <Form onSubmit={this.onFormSubmit}>
            <Form.Control name="name" type="text" size="sm" placeholder="Project Name" value={this.state.project.name} onChange={e => this.onChange(e,'name')}/>
            <Form.Control name="description" as="textarea" rows={3} placeholder="Project Description" className="my-2" value={this.state.project.description} onChange={e => this.onChange(e,'description')}/>
            <>
            {this.props.selectedProject &&
                <ListGroup as="ul" className="mb-2" variant="flush">
                    <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                        <div className="me-auto">
                            <small>Documents</small>
                        </div>
                        <Badge bg="primary" pill>{this.state.project.doc_count}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                        <div className="me-auto">
                            <small>Extractions</small>
                        </div>
                        <Badge bg="primary" pill>{this.state.project.extraction_count}</Badge>
                    </ListGroup.Item>
                    <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                        <div className="me-auto">
                            <small>Created At</small>
                        </div>
                        <small>{dayjs(this.state.project.created_at).format('DD-MM-YYYY')}</small>
                    </ListGroup.Item>
                </ListGroup>
            }
            </>
            
            <Row className="mt-4">
                <Col>
                    <Button variant="primary" size="sm" type="submit">{this.props.selectedProject ? 'Update' : 'Create'}</Button>
                    { this.props.selectedProject &&
                        <Button className="ms-1" variant="danger" size="sm" onClick={this.deleteProject}>Delete Project</Button>
                    }
                </Col>
            </Row>
        </Form>

        )
    }

}