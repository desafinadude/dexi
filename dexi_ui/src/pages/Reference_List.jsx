import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';
import dayjs from 'dayjs';

import { Link } from 'react-router-dom';

import DataTable, { defaultThemes } from 'react-data-table-component';
import { DexiAlert } from '../components/DexiAlert';
import { UploadReference } from '../components/UploadReference';


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
import { mdiFormatListBulletedType } from '@mdi/js';



export class ReferenceList extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false,
            columns: [
                {
                    name: 'Name',
                    selector: row => row.name,
                    cell: row => <Link className="fw-bold text-decoration-none" to={`project/${row.id}`}>{row.name}</Link>,
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
            references: [],
            showModal: false,
            alert: {
                show: false,
                variant: 'success',
                message: ''
            },
            selectedRows: [],
        }
        
        
    }

    componentDidMount() {

        let self = this;


        if(isTokenSet()) {
            this.setState({tokenSet: true});
        } else {
            Window.location.href = '/login';
        }

        self.getReferences();
        
    }

    getReferences = () => {
        let self = this;
        axios.get(process.env.API + '/dexi/reference', { headers: {
                "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({ references: response.data })
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
                showProject: form == 'reference' ? true : false,
            }
        );
    }

    referenceAction(action) {
        let self = this;
        if(action == 'delete') {

            self.setState({alert: {show: true, variant: 'success', message: 'Deleting'}});
            
            // DELETE

            var newFormData = new FormData();

            newFormData.append("references", self.state.selectedRows.map(reference => reference.id).join(','));
            newFormData.append("action", "delete");

            axios.post(process.env.API + '/dexi/reference/', newFormData, { headers: {
                "Authorization": "token " + getCookie('dexitoken')
                }})
                .then((response) => {
                    self.setState({selectedRows: []}, () => self.getReferences());
                })
                .catch((error) => {
                    console.log(error);
                })

        }

    }

    render() {
        return (<section className="pt-5" style={{minHeight: '100vh'}}>
            
            <Container>
                <DexiAlert alert={this.state.alert} />
            </Container>

            <Container>

                <Breadcrumb>
                    <Breadcrumb.Item linkAs="span"><Link to="/">Home</Link></Breadcrumb.Item>
                    <Breadcrumb.Item active>References</Breadcrumb.Item>
                </Breadcrumb>
                
                <Row className="mb-2">
                    <Col>
                        <h4 className="fw-normal"><Icon path={mdiFormatListBulletedType} size={0.9} /> References</h4>
                    </Col>
                    <Col md="auto">
                        <Button variant="primary" onClick={() => this.showModal('project')} size="sm"><Icon path={mdiFormatListBulletedType} size={0.6} /> New Reference</Button>
                        <DropdownButton variant="primary" title="Do Something" size="sm" className="d-inline-block mx-1" disabled={this.state.selectedRows.length == 0 ? true : false}>
                            <Dropdown.Item onClick={() => this.referenceAction('delete')}>Delete File</Dropdown.Item>
                        </DropdownButton>
                    </Col>
                </Row>

                <div className="animate__animated animate__fadeIn">    
                    <DataTable
                        columns={this.state.columns}
                        data={this.state.references}
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
                        <Modal.Title>Upload New Reference</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <UploadReference onHide={() => this.setState({showModal: false})} onGetReferences={() => this.getReferences()} />
                    </Modal.Body>
                    
                </Modal>

                

            </Container>

        </section>)

    }

}