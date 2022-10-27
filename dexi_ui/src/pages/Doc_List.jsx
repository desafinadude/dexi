import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';
import dayjs from 'dayjs';

import DataTable, { defaultThemes } from 'react-data-table-component';
import { Upload } from '../components/Upload';
import { Project } from '../components/Project';
import { Extract } from '../components/Extract';
import { MoveDoc } from '../components/MoveDoc';
import { UploadReference } from '../components/UploadReference';
import { DexiAlert } from '../components/DexiAlert';

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

import Icon from '@mdi/react';
import { mdiFileUpload, mdiShuffleVariant, mdiDiversify, mdiFolder, mdiRefresh, mdiSelectGroup } from '@mdi/js';



export class DocList extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false,
            status: [
                { id: 1, name: 'UPLOADED', color: 'primary' },
                { id: 2, name: 'CONVERTING', color: 'warning' },
                { id: 3, name: 'CONVERTED', color: 'success' },
                { id: 4, name: 'EXTRACTING', color: 'warning' },
                { id: 5, name: 'EXTRACTED', color: 'success' }
            ],
            columns: [
                {
                    name: 'ID',
                    selector: row => row.id,
                    maxWidth: '10px'
                },
                {
                    name: 'Name',
                    selector: row => row.name,
                    cell: row => <a className="text-decoration-none" href={`doc/${row.id}`}>{row.name}</a>
                },
                {
                    name: 'Type',
                    selector: row => row.type.replace('application/', '').toUpperCase(),
                    maxWidth: '50px'
                },
                {
                    name: 'Project',
                    selector: row => <Badge bg="info">{this.state.projects && this.state.projects.find(project => project.id == row.project).name}</Badge>,
                    maxWidth: '150px'
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
                    cell: row => {
                        return (
                            <>
                                {/* UPLOADED */}
                                <OverlayTrigger placement="top" overlay={<Tooltip>Uploaded</Tooltip>}>
                                    <div className="me-1">
                                        <Button size="sm" variant={row.status >= 1 ? 'primary' : 'outline-info'} disabled={row.status > 1}><Icon path={mdiFileUpload} size={0.7} color={row.status >= 1 ? '#fff' : '#666'}/></Button>
                                    </div>
                                </OverlayTrigger>

                                {/* CONVERTED */}
                                <OverlayTrigger placement="top" overlay={<Tooltip>{row.status == 2 ? 'Converting' : 'Converted'}</Tooltip>}>
                                    <div className="me-1">
                                        <Button size="sm" variant={row.status == 2 ? 'secondary' : row.status >= 3 ? 'primary' : 'outline-info'} className={ row.status == 2 && 'animate__animated animate__infinite animate__pulse'} disabled={row.status >= 3} onClick={() => row.status == 2 ? console.log('2') : console.log('1')}><Icon path={mdiShuffleVariant} size={0.7} color={row.status >= 2 ? '#fff' : '#666'}/></Button>
                                    </div>
                                </OverlayTrigger>

                                {/* EXTRACTED */}
                                <OverlayTrigger placement="top" overlay={<Tooltip>{row.status == 4 ? 'Extracting' : 'Extracted'}</Tooltip>}>
                                    <div>
                                        <Button size="sm" variant={row.status == 4 ? 'secondary' : row.status == 5 ? 'primary' :  'outline-info'} className={ row.status == 4 && 'animate__animated animate__infinite animate__pulse'} disabled={row.status >= 4}><Icon path={mdiDiversify} size={0.7} color={row.status >= 4 ? '#fff' : '#666'}/></Button>
                                    </div>
                                </OverlayTrigger>
                        
                            </>
                        )
                    },
                    maxWidth: '180px'
                },

            ],
            docs: [],
            projects: [],
            selectedProject: undefined,
            selectedRows: [],
            showModal: false,
            showUpload: false,
            showProject: false,
            showExtract: false,
            showMoveDoc: false,
            showReferenceUpload: false,
            alert: {
                show: false,
                variant: 'success',
                message: ''
            }
        }
        this.docActionRef = React.createRef();
        
    }

    componentDidMount() {

        let self = this;


        if(isTokenSet()) {
            this.setState({tokenSet: true});
        } else {
            window.location.href='/';
        }

        self.getProjects();
        self.getDocs();    

        // GetDocs every 5 seconds
        setInterval(() => {
            self.getDocs();
        }, 5000);


        
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

    getDocs = () => {
        

        let self = this;

        let url = self.state.selectedProject ? process.env.API + '/doc/api/project/' + self.state.selectedProject.id : process.env.API + '/doc/api';

        axios.get(url, 
            { 
            headers: { "Authorization": "token " + getCookie('dexitoken')}
            })
            .then((response) => {
                self.setState({ docs: response.data })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    selectRows = ({ selectedRows }) => {
        let self = this;
        self.setState({selectedRows: selectedRows});
    }

    docAction = (action) => {
        let self = this;
        if (self.state.selectedRows.length > 0) {

            if(action == 'convert') {

                // CONVERT

                if(self.state.selectedRows.filter(doc => doc.status >= 3).length > 0) {
                    self.setState({alert: {show: true, variant: 'danger', message: 'Some documents are already converted'}});
                }  else {

                    self.setState({alert: {show: true, variant: 'success', message: 'Converting your documents to text. This can take a while.'}});


                    var newFormData = new FormData();

                    newFormData.append("docs", self.state.selectedRows.map(doc => doc.id).join(','));
                    newFormData.append("action", "convert");
                
                    axios.post(process.env.API + '/doc/api/', newFormData, { headers: {
                        "Authorization": "token " + getCookie('dexitoken')
                        }})
                        .then((response) => {
                            console.log(response)
                        })
                        .catch((error) => {
                            console.log(error);
                        })

                }
                
            }
            if(action == 'extract') {

                self.showModal('extract');
                
            }

            if(action == 'move') {

                // MOVE

                self.showModal('move');
            }

            if(action == 'delete') {

                self.setState({alert: {show: true, variant: 'success', message: 'Deleting'}});
                
                // DELETE

                var newFormData = new FormData();

                newFormData.append("docs", self.state.selectedRows.map(doc => doc.id).join(','));
                newFormData.append("action", "delete");

                axios.post(process.env.API + '/doc/api/', newFormData, { headers: {
                    "Authorization": "token " + getCookie('dexitoken')
                    }})
                    .then((response) => {
                        self.setState({selectedRows: []});
                    })
                    .catch((error) => {
                        console.log(error);
                    })

            }
            

        } else {
            alert('No documents Selected');
        }

    }

    onNameChange = (e) => {
        console.log(e);
    }

    selectProject = (e) => {
        let self = this;
        e.target.value == 'all' ? self.setState({selectedProject: undefined}) : self.setState({selectedProject: self.state.projects.find((project) => project.id == e.target.value)});
        self.getDocs();
    }
    
    showModal(form) {
        this.setState(
            {   
                showModal: true, 
                showUpload: form == 'upload' ? true : false, 
                showProject: form == 'project' ? true : false,
                showExtract: form == 'extract' ? true : false,
                showMoveDoc: form == 'move' ? true : false,
                showReferenceUpload: form == 'reference' ? true : false
            }
        );
    }

    render() {
        return (<section className="pt-5" style={{minHeight: '100vh'}}>

            <Container>
                <DexiAlert alert={this.state.alert} />
            </Container>

            <Container>

                <Row className="mb-2">
                    <Col>
                        <h4 className="fw-normal" title={this.state.selectedProject && this.state.selectedProject.description ? this.state.selectedProject.description : ''}>{this.state.selectedProject ? this.state.selectedProject.name : 'All Documents'}</h4>
                    </Col>
                    <Col md="auto">
                        <DropdownButton variant="primary" title="NEW" size="sm" className="d-inline-block">
                            <Dropdown.Item onClick={() => this.showModal('upload')}>Document</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.showModal('project')}>Project</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.showModal('reference')}>Reference</Dropdown.Item>
                        </DropdownButton>
                        
                        <DropdownButton variant="primary" title="DO SOMETHING" size="sm" className="d-inline-block mx-1">
                            <Dropdown.Item onClick={() => this.docAction('convert')}>Convert To Text</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.docAction('extract')}>Extract Entities</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.docAction('move')}>Move To Project</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.docAction('delete')}>Delete File</Dropdown.Item>
                        </DropdownButton>

                        <Form.Select size="sm" onChange={(e) => this.selectProject(e)} className="animate__animated animate__fadeIn d-inline-block w-auto me-1 h-100">
                            <option value="">All Projects</option>
                            {this.state.projects.map((project) => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </Form.Select>
                        
                        <Button size="sm" variant="info" onClick={() => this.getDocs()}><Icon path={mdiRefresh} size={0.7} color="#fff"/></Button>
                    </Col>
                </Row>

                <div className="animate__animated animate__fadeIn">    
                    <DataTable
                        columns={this.state.columns}
                        data={this.state.docs}
                        dense={false}
                        striped={true}
                        fixedHeader={true}
                        highlightOnHover={false}
                        selectableRows
                        onSelectedRowsChange={this.selectRows}
                    />
                </div>
               
               <Modal centered show={this.state.showModal} onHide={() => this.setState({showModal: false})}>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.showUpload ? 'Upload Documents' : this.state.showProject ? 'Create Project' : this.state.showExtract ? 'Start Extraction' : this.state.showMoveDoc ? 'Move Document' : 'Upload Reference'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { this.state.showUpload && <Upload projects={this.state.projects} onHide={() => this.setState({showModal: false})} /> }
                        { this.state.showProject && <Project onHide={() => this.setState({showModal: false})} onGetProjects={() => this.getProjects()} selectedProject={this.state.selectedProject}/> }
                        { this.state.showMoveDoc && <MoveDoc projects={this.state.projects} docs={this.state.selectedRows} onHide={() => this.setState({showModal: false})} /> }
                        { this.state.showExtract && <Extract docs={this.state.selectedRows} onHide={() => this.setState({showModal: false})} /> }
                        { this.state.showReferenceUpload && <UploadReference /> }
                    </Modal.Body>
                    
                </Modal>

                

            </Container>

        </section>)

    }

}