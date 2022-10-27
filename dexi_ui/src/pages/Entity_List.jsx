import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';
import dayjs from 'dayjs';

import DataTable, { defaultThemes } from 'react-data-table-component';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { mdiSelectGroup } from '@mdi/js';



export class EntityList extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false,
            pending: true,
            columns: [
                {
                    name: 'Entity',
                    selector: row => row.entity,
                    cell: row => <strong>{row.entity}</strong>,
                    sortable: true
                },
                {
                    name: 'Schema',
                    selector: row => row.schema,
                    cell: row => <div className={'DexiBadge highlight highlight-' + row.schema}>{row.schema}</div>,
                    maxWidth: '120px',
                    sortable: true
                },
                {
                    name: 'Count',
                    selector: row => row.count,
                    maxWidth: '100px',
                    center: true,
                    sortable: true
                },
                {
                    name: 'Documents',
                    selector: row => row.found.length,
                    maxWidth: '100px',
                    center: true,
                    sortable: true
                },
                {
                    name: 'Projects',
                    selector: row => row.projects.length,
                    maxWidth: '100px',
                    center: true,
                    sortable: true
                }

            ],
            projects: [],
            entities: [],
            selectedRows: [],
            selectedProject: undefined
        }
        
    }

    componentDidMount() {

        let self = this;


        if(isTokenSet()) {
            this.setState({tokenSet: true});
        } else {
            window.location.href='/';
        }

        self.getProjects();
        self.getEntities();
        

        
    }


    getProjects = () => {
        let self = this;

        axios.get(process.env.API + '/project/api', { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({ projects: response.data })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    getEntities = () => {

        let self = this;

        let url = self.state.selectedProject ? process.env.API + '/entity/api/project/' + self.state.selectedProject.id : process.env.API + '/entity/api';

        axios.get(url, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {

                console.log(response);

                let entities = [];
                
                response.data.forEach((entity) => {

                    // DOCUMENTS
                    
                    if(entities.find(e => e.entity === entity.entity) == undefined) {
                        entities.push({
                            entity: entity.entity,
                            schema: entity.schema,
                            count: 1,
                            projects: [],
                            found: [{
                                doc: entity.doc,
                                page: [entity.page]
                            }]
                        })
                    } else {
                        

                        if(entities.find(e => e.entity === entity.entity).found.find(f => f.doc.id === entity.doc.id) == undefined) {
                            entities.find(e => e.entity === entity.entity).found.push({
                                doc: entity.doc,
                                page: [entity.page]
                            })
                            entities.find(e => e.entity === entity.entity).count++;
                        } else {
                            if(entities.find(e => e.entity === entity.entity).found.find(f => f.doc.id === entity.doc.id).page.indexOf(entity.page) == -1) {
                                entities.find(e => e.entity === entity.entity).found.find(f => f.doc.id === entity.doc.id).page.push(entity.page)
                            }
                            entities.find(e => e.entity === entity.entity).count++;
                        }

                    }

                    // Project
                    if(entities.find(e => e.entity === entity.entity).projects.find(f => f.id === entity.doc.project.id) == undefined) {
                        entities.find(e => e.entity === entity.entity).projects.push(entity.doc.project)
                    }

                        
                
                })

                self.setState({entities: entities, pending: false});


            })
            .catch((error) => {
                console.log(error);
            })
    }

    exportEntities = () => {
        let self = this;

        
        
        


    }

    selectProject = (e) => {
        let self = this;
        e.target.value == 'all' ? self.setState({selectedProject: undefined}) : self.setState({selectedProject: self.state.projects.find((project) => project.id == e.target.value)},
        () => {
            self.getEntities();
        });
        
    }

    selectRows = ({ selectedRows }) => {
        let self = this;
        self.setState({selectedRows: selectedRows});
    }


    render() {
        return (<section className="pt-5" style={{minHeight: '100vh'}}>

                <Container className="my-4">

                
                    <Row className="mb-2">
                        <Col>
                            <h4 className="fw-normal">{this.state.selectedProject ? this.state.selectedProject.name : 'All Entities'}</h4>
                        </Col>
                        <Col md="auto">
                            <DropdownButton variant="primary" title="DO SOMETHING" size="sm" className="d-inline-block mx-1">
                                <Dropdown.Item onClick={() => this.entityAction('export')}>Export Entities</Dropdown.Item>
                                <Dropdown.Item onClick={() => this.entityAction('delete')}>Delete Entity</Dropdown.Item>
                            </DropdownButton>
                            <Form.Select size="sm" onChange={(e) => this.selectProject(e)} className="animate__animated animate__fadeIn d-inline-block w-auto me-1 h-100">
                                <option value="">All Projects</option>
                                {this.state.projects.map((project) => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Row>

                    <DataTable
                        columns={this.state.columns}
                        data={this.state.entities}
                        dense={false}
                        striped={true}
                        fixedHeader={true}
                        highlightOnHover={true}
                        selectableRows
                        onSelectedRowsChange={this.selectRows}
                        progressPending={this.state.pending}
                        expandableRows={true}
                        expandableRowsComponent={EntityDetails}
                        expandOnRowClicked={true}
                        expandOnRowDoubleClicked={false}
                        expandableRowsHideExpander={false}
                        pagination={false}
                    />

                </Container>

            </section>

        )

    }

}

const EntityDetails = ({ data }) => {
    
    return (<ListGroup as="ol" variant="flush" className="entityDetails py-3">
    {
        data.found.map((f) => {
            return (
                <ListGroup.Item as="li" key={f.doc.id}>
                    <div className="ms-5 me-auto">
                        <div className="fw-bold"><a className="text-decoration-none" href={'/doc/' + f.doc.id}>{f.doc.name}</a> <Badge bg="info">{f.doc.project.name}</Badge>
                        <>
                        {
                            f.page.reverse().map((p) => {
                                return <Badge key={p} className="mx-1" variant="info">{p}</Badge>
                            })
                        }
                        </>
                        </div>
                    </div>
                </ListGroup.Item>
            )
        })
    }
    </ListGroup>)

}