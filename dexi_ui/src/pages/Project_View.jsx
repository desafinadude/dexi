import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie, schemasLookup } from '../utils/utils';
import dayjs from 'dayjs';

import DataTable, { defaultThemes } from 'react-data-table-component';
import { Upload } from '../components/Upload';
import { Project } from '../components/Project';
import { Extract } from '../components/Extract';
import { DexiAlert } from '../components/DexiAlert';
import { EntityPages } from '../components/EntityPages';
import { ExtractionDetails } from '../components/ExtractionDetails';
import { ProjectDetails } from '../components/ProjectDetails';

import _ from 'lodash';

import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ListGroup from 'react-bootstrap/ListGroup';


import Icon from '@mdi/react';
import { mdiFileUpload, mdiShuffleVariant, mdiDiversify, mdiFolder, mdiRefresh, mdiSelectGroup, mdiBriefcase, mdiPickaxe } from '@mdi/js';



export class ProjectView extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false,
            status: [
                { id: 1, name: 'UPLOADED', color: 'primary' },
                { id: 2, name: 'CONVERTING', color: 'warning' },
                { id: 3, name: 'CONVERTED', color: 'success' }
            ],
            docsColumns: [
                {
                    name: 'Name',
                    selector: row => row.name,
                    cell: row => <a className="fw-bold text-decoration-none" href={`/doc/${row.id}?project=${this.state.selectedProject.id}`}>{row.name}</a>
                },
                {
                    name: 'Type',
                    selector: row => row.type.replace('application/', '').toUpperCase(),
                    maxWidth: '50px'
                },
                {
                    name: 'Created',
                    selector: row => row.created_at,
                    cell: row => dayjs(row.created_at).format('DD-MM-YYYY'),
                    maxWidth: '150px'
                },
                {
                    name: 'Status',
                    selector: row => row.status,
                    cell: row => <span className={'badge bg-' + this.state.status.find(status => status.id == row.status).color}>{this.state.status.find(status => status.id == row.status).name}</span>,
                    cell: row => row.status == 2 ? <Badge className="animate__animated animate__infinite animate__pulse">Converting</Badge> : row.status == 3 ? <Badge bg="secondary">Ready</Badge> : row.status == 4 ? <Badge className="animate__animated animate__infinite animate__pulse">Extracting</Badge> : '',
                    maxWidth: '180px'
                },
                {
                    name: 'Extractions',
                    selector: row => row.extraction_count,
                    cell: row => row.extraction_count,
                    maxWidth: '100px',
                    center: true,
                },

            ],
            entitiesColumns: [
                {
                    name: 'Entity',
                    selector: row => row.entity,
                    cell: row => <strong>{row.entity}</strong>,
                    sortable: true
                },
                {
                    name: 'Schema',
                    selector: row => row.schema,
                    cell: row => {
                        // Get schema definition from schemaLookup
                        let schema = schemasLookup[row.schema];
                        return <OverlayTrigger placement="top" overlay={
                            <Tooltip>{schema}</Tooltip>
                        }>
                            <div className={'DexiBadge highlight highlight-' + row.schema}>{row.schema}
                            </div>
                        </OverlayTrigger>
                    },
                    maxWidth: '120px',
                    sortable: true
                },
                {
                    name: 'Count',
                    selector: row => row.entity_count,
                    maxWidth: '100px',
                    center: true,
                    sortable: true
                },
                {
                    name: 'Documents',
                    selector: row => row.doc_count,
                    maxWidth: '100px',
                    center: true,
                    sortable: true
                }

            ],
            entities: [],
            selectedProject: undefined,
            docs: [],
            docsLoading: true,
            extractions: [],
            selectedExtraction: undefined,
            selectedDocsRows: [],
            selectedEntitiesRows: [],
            entitiesLoading: true,
            showModal: false,
            showUpload: false,
            showProject: false,
            showExtract: false,
            showMoveDoc: false,
            showEntityPages: false,
            showExtractionDetails: false,
            showProjectDetails: false,
            selectedEntity: undefined,
            alert: {
                show: false,
                variant: 'success',
                message: ''
            },
            tab: 'docs'
        }
        this.docActionRef = React.createRef();
        
    }

    componentDidMount() {

        let self = this;
        let projectId = window.location.href.split('/').pop();

        if(isTokenSet()) {
            this.setState({tokenSet: true});
        } else {
            window.location.href='/';
        }
        
        self.getProject(projectId);
        
        
    }

    getProject = (projectId) => {
        let self = this;
        axios.get(process.env.API + '/dexi/project/' + projectId, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({ selectedProject: response.data }, () => {
                    self.getDocs();
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    getExtractions = (projectId) => {

        let self = this;
        axios.get(process.env.API + '/dexi/project/' + projectId + '/extractions', { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                if(response.data.length > 0) {
                    self.setState(
                        { 
                            extractions: response.data, 
                            selectedExtraction: response.data[0].id 
                        },
                        () => {
                            if(self.state.entities.length == 0) {
                                self.getEntities();
                            }
                        }
                    )
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    

    getDocs = () => {


        let self = this;

        let url = process.env.API + '/dexi/project/' + self.state.selectedProject.id + '/docs';

        axios.get(url, 
            { 
            headers: { "Authorization": "token " + getCookie('dexitoken')}
            })
            .then((response) => {
                self.setState({ docs: response.data, docsLoading: false })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    getEntities = () => {
        let self = this;

        let url = process.env.API + '/dexi/project/' + self.state.selectedProject.id + '/entities/' + self.state.selectedExtraction;

        axios.get(url, 
            { 
            headers: { "Authorization": "token " + getCookie('dexitoken')}
            })
            .then((response) => {
                self.setState(
                    { 
                        entities: response.data,
                        entitiesLoading: false 
                    })
            })
            .catch((error) => {
                console.log(error);
            })
            
    }

    selectDocsRows = ({ selectedRows }) => {
        let self = this;
        self.setState({selectedDocsRows: selectedRows});
    }

    selectEntitiesRows = ({ selectedRows }) => {
        let self = this;
        self.setState({selectedEntitiesRows: selectedRows});
    }

    docAction = (action) => {
        let self = this;
        if (self.state.selectedDocsRows.length > 0) {

            if(action == 'convert') {

                // CONVERT

                if(self.state.selectedDocsRows.filter(doc => doc.status >= 3).length > 0) {
                    self.setState({alert: {show: true, variant: 'danger', message: 'Some documents are already converted'}});
                }  else {

                    self.setState({alert: {show: true, variant: 'success', message: 'Converting your documents to text. This can take a while.'}});


                    var newFormData = new FormData();

                    newFormData.append("docs", self.state.selectedDocsRows.map(doc => doc.id).join(','));
                    newFormData.append("action", "convert");
                
                    axios.post(process.env.API + '/dexi/project/'+ self.state.selectedProject.id + '/docs', newFormData, { headers: {
                        "Authorization": "token " + getCookie('dexitoken')
                        }})
                        .then((response) => {
                            self.setState({selectedDocsRows: []});
                        })
                        .catch((error) => {
                            console.log(error);
                        })

                }
                
            }
            if(action == 'extract') {
                
                if(self.state.selectedDocsRows.filter(doc => doc.status < 3).length > 0) {
                    self.setState({alert: {show: true, variant: 'danger', message: 'Some documents have not been converted yet.'},selectedDocsRows: []});
                }  else {
                    self.showModal('extract');
                }
                
            }

            

            if(action == 'delete') {

                self.setState({alert: {show: true, variant: 'success', message: 'Deleting'}});
                
                // DELETE

                var newFormData = new FormData();

                newFormData.append("docs", self.state.selectedDocsRows.map(doc => doc.id).join(','));
                newFormData.append("action", "delete");

                axios.post(process.env.API + '/dexi/project/'+ self.state.selectedProject.id + '/docs', newFormData, { headers: {
                    "Authorization": "token " + getCookie('dexitoken')
                    }})
                    .then((response) => {
                        self.setState({selectedDocsRows: []});
                    })
                    .catch((error) => {
                        console.log(error);
                    })

            }
            

        } else {
            alert('No documents Selected');
        }

    }

    entityAction = (action) => {
        let self = this;

        if(action == 'delete') {

            self.setState({alert: {show: true, variant: 'success', message: 'Deleting'}});
            
            // DELETE

            var newFormData = new FormData();

            newFormData.append("entities", self.state.selectedEntitiesRows.map(entity => entity.id).join(','));
            newFormData.append("action", "delete");

            axios.post(process.env.API + '/dexi/entity/delete/', newFormData, { headers: {
                "Authorization": "token " + getCookie('dexitoken')
                }})
                .then((response) => {
                    self.setState({selectedEntitiesRows: []}, () => self.getEntities());
                })
                .catch((error) => {
                    console.log(error);
                })

        }
    }

    selectProject = (e) => {
        let self = this;
        e.target.value == 'all' ? self.setState({selectedProject: undefined}) : self.setState({selectedProject: self.state.projects.find((project) => project.id == e.target.value)});
        self.getDocs();
    }

    selectExtraction = (e) => {
        let self = this;
        self.setState({selectedExtraction: e.target.value, entitiesLoading: true}, () => self.getEntities());
    }
    
    showModal(form) {
        this.setState(
            {   
                showModal: true, 
                showUpload: form == 'upload' ? true : false, 
                showProject: form == 'project' ? true : false,
                showExtract: form == 'extract' ? true : false,
                showMoveDoc: form == 'move' ? true : false,
                showExtractionDetails: form == 'extractionDetails' ? true : false,
                showProjectDetails: form == 'projectDetails' ? true : false,
            }
        );
    }

    switchTab = (tab) => {
        let self = this;
        
        self.setState({tab: tab});
        
        let fetchDocs;
        
        if(tab == 'docs') {
            self.getDocs();
        } else {
            if(self.state.extractions.length == 0) {
                self.getExtractions(self.state.selectedProject.id);
            }
        }
    }

    setAlert = (alert) => {
        this.setState({alert: alert});
    }

    

    

    render() {
        return (<section className="py-5" style={{minHeight: '100vh'}}>

            <Container>
                <DexiAlert alert={this.state.alert} />
            </Container>

            <Container>

                <Breadcrumb>
                    <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item href="/project">Projects</Breadcrumb.Item>
                    <Breadcrumb.Item active>{this.state.selectedProject && this.state.selectedProject.name}</Breadcrumb.Item>
                </Breadcrumb>

                <Row className="mb-2">
                    <Col>
                        <h4 className="fw-normal" title={this.state.selectedProject && this.state.selectedProject.description ? this.state.selectedProject.description : ''}><Icon path={mdiBriefcase} size={0.9} /><span onClick={() => this.showModal('projectDetails')} className="text-primary" style={{cursor: "pointer"}}>{this.state.selectedProject && this.state.selectedProject.name}</span></h4>
                    </Col>
                </Row>

                <Tabs activeKey={this.state.tab} onSelect={(k) => this.switchTab(k)} className="mt-3">
                        
                    <Tab eventKey="docs" title="Documents" className="bg-white">
                        <Row className="mb-2 justify-content-end p-2">
                            <Col md="auto">
                                <Button variant="primary" onClick={() => this.showModal('upload')} size="sm"><Icon path={mdiFileUpload} size={0.6} /> New Document</Button>
                                
                                <DropdownButton variant="primary" title="Do Something" size="sm" className="d-inline-block mx-1" disabled={this.state.selectedDocsRows.length == 0 ? true : false}>
                                    <Dropdown.Item onClick={() => this.docAction('convert')}>Convert To Text</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.docAction('extract')}>Extract Entities</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.docAction('delete')}>Delete File</Dropdown.Item>
                                </DropdownButton>
                                
                                <Button size="sm" variant="info" onClick={() => this.getDocs()}><Icon path={mdiRefresh} size={0.7} color="#fff"/></Button>
                            </Col>
                        </Row>

                        <div className="animate__animated animate__fadeIn">    
                            <DataTable
                                columns={this.state.docsColumns}
                                data={this.state.docs}
                                dense={false}
                                striped={true}
                                fixedHeader={true}
                                highlightOnHover={false}
                                selectableRows
                                onSelectedRowsChange={this.selectDocsRows}
                                progressPending={this.state.docsLoading}
                                pagination={true}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="entities" title="Entities" className="bg-white">
                        <Row className="justify-content-end py-3 px-2">
                            <Col>
                                {this.state.selectedExtraction &&
                                    <strong><Icon path={mdiPickaxe} size={0.8} style={{marginTop: "-3px"}} /> <span onClick={() => this.showModal('extractionDetails')} className="text-primary" style={{cursor: "pointer"}}>{this.state.extractions.find(ex => ex.id == this.state.selectedExtraction).name}</span></strong>
                                }
                            </Col>
                            <Col md="auto">
                                <Form.Select size="sm" onChange={(e) => this.selectExtraction(e)} className="animate__animated animate__fadeIn d-inline-block w-auto me-1 h-100">
                                    {
                                        this.state.extractions.map((extraction, index) => {
                                            return <option key={index} value={extraction.id}>{extraction.name}</option>
                                        })
                                    }
                                </Form.Select>
                                <DropdownButton variant="primary" title="Do Something" size="sm" className="d-inline-block mx-1" disabled={this.state.selectedEntitiesRows.length == 0 ? true : false}>
                                    <Dropdown.Item onClick={() => this.entityAction('merge')}>Merge Entities</Dropdown.Item>
                                    <Dropdown.Item onClick={() => this.entityAction('delete')}>Delete Entity</Dropdown.Item>
                                </DropdownButton>

                                <Button size="sm" variant="info" onClick={() => this.getEntities()}><Icon path={mdiRefresh} size={0.7} color="#fff"/></Button>
                            </Col>
                        </Row>
                        <div className="animate__animated animate__fadeIn">    
                            <DataTable
                                columns={this.state.entitiesColumns}
                                data={this.state.entities}
                                dense={false}
                                striped={true}
                                highlightOnHover={true}
                                selectableRows
                                expandableRows={true}
                                expandableRowsComponent={row => {return <EntityPages entity={row} project={this.state.selectedProject.id}/>}}
                                onSelectedRowsChange={this.selectEntitiesRows}
                                progressPending={this.state.entitiesLoading}
                                pagination={true}
                            />
                        </div>
                    </Tab>
                    
                
                </Tabs>

                
               
               <Modal centered show={this.state.showModal} onHide={() => this.setState({showModal: false})}>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.showUpload ? 'Upload Documents' : this.state.showProject ? 'Create Project' : this.state.showExtract ? 'Start Extraction' : this.state.showMoveDoc ? 'Move Document' : this.state.showExtractionDetails ? 'Extraction Details' : this.state.showProjectDetails ? 'Project Details' : ''}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { this.state.showUpload && <Upload project={this.state.selectedProject} onHide={() => this.setState({showModal: false})} onGetDocs={() => this.getDocs()} /> }
                        { this.state.showProject && <Project onHide={() => this.setState({showModal: false})} onGetProjects={() => this.getProjects()} selectedProject={this.state.selectedProject}/> }
                        { this.state.showExtract && <Extract docs={this.state.selectedDocsRows} project={this.state.selectedProject} onHide={() => this.setState({showModal: false})} onSetAlert={(alert) => this.setAlert(alert)}/> }
                        { this.state.showExtractionDetails && <ExtractionDetails onHide={() => this.setState({showModal: false})} extraction={this.state.selectedExtraction} onGetExtractions={() => this.getExtractions()}/> }
                        { this.state.showProjectDetails && <ProjectDetails onHide={() => this.setState({showModal: false})} project={this.state.selectedProject} /> }
                    </Modal.Body>
                    
                </Modal>

                

            </Container>

        </section>)

    }

}