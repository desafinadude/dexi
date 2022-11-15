import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';
import dayjs from 'dayjs';

import DataTable, { defaultThemes } from 'react-data-table-component';
import { Project } from '../components/Project';
import { DexiAlert } from '../components/DexiAlert';

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

import Icon from '@mdi/react';
import { mdiBriefcase, mdiBriefcaseEdit, mdiBriefcasePlus, mdiBriefcaseRemove } from '@mdi/js';



export class ProjectList extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false,
            columns: [
                {
                    name: 'Name',
                    selector: row => row.name,
                    cell: row => <a className="fw-bold text-decoration-none" href={`project/${row.id}`}>{row.name}</a>,
                    sortable: true,
                    
                },
                {
                    name: 'Description',
                    selector: row => row.description,
                    cell: row => row.description,
                    
                },
                {
                    name: 'Documents',
                    selector: row => row.doc_count,
                    maxWidth: '120px',
                    sortable: true,
                },
                {
                    name: 'Extractions',
                    selector: row => row.extraction_count,
                    maxWidth: '120px',
                    sortable: true,
                },
                {
                    name: 'Created',
                    selector: row => row.created_at,
                    cell: row => dayjs(row.created_at).format('DD-MM-YYYY'),
                    maxWidth: '150px',
                    sortable: true,
                }
            ],
            projects: [],
            showModal: false,
            alert: {
                show: false,
                variant: 'success',
                message: ''
            },
            loading: false
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
        
    }

    getProjects = () => {
        let self = this;
        self.setState({loading: true});
        axios.get(process.env.API + '/dexi/project/', { headers: {
                "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({ projects: response.data, loading: false });
            })
            .catch((error) => {
                console.log(error);
            })
    }
    
    selectRows = ({ selectedRows }) => {
        let self = this;
        self.setState({selectedRows: selectedRows});
    }

    showModal(form) {
        this.setState(
            {   
                showModal: true, 
                showProject: form == 'project' ? true : false,
            }
        );
    }
    

    render() {
        return (<section className="pt-5" style={{minHeight: '100vh'}}>

            <Container>
                <DexiAlert alert={this.state.alert} />
            </Container>

            <Container>

                <Breadcrumb>
                    <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                    <Breadcrumb.Item active>Projects</Breadcrumb.Item>
                </Breadcrumb>
                
                <Row className="mb-2">
                    <Col>
                        <h4 className="fw-normal"><Icon path={mdiBriefcase} size={0.9} /> Projects</h4>
                    </Col>
                    <Col md="auto">
                        <Button variant="primary" onClick={() => this.showModal('project')} size="sm"><Icon path={mdiBriefcasePlus} size={0.6} /> New Project</Button>
                    </Col>
                </Row>

                <div className="animate__animated animate__fadeIn">    
                    <DataTable
                        columns={this.state.columns}
                        data={this.state.projects}
                        dense={false}
                        striped={true}
                        fixedHeader={true}
                        highlightOnHover={false}
                        progressPending={this.state.loading}

                    />
                </div>
               
               <Modal centered show={this.state.showModal} onHide={() => this.setState({showModal: false})}>
                    <Modal.Header closeButton>
                        <Modal.Title>Start New Project</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Project onHide={() => this.setState({showModal: false})} onGetProjects={() => this.getProjects()} />
                    </Modal.Body>
                    
                </Modal>

                

            </Container>

        </section>)

    }

}