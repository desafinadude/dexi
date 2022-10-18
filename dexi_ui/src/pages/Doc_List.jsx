import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';
import dayjs from 'dayjs';

import DataTable, { defaultThemes } from 'react-data-table-component';
import { Upload } from '../components/Upload';
import { Folder } from '../components/Folder';
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
                    name: 'Folder',
                    selector: row => <Badge bg="info">{this.state.folders.find(folder => folder.id == row.folder).name}</Badge>,
                    maxWidth: '60px'
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
            folders: [],
            selectedFolder: undefined,
            selectedRows: [],
            showModal: false,
            showUpload: false,
            showFolder: false,
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
        }

        // Get Folders List
        axios.get(process.env.API + '/folder/api', { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({ folders: response.data })
            })
            .catch((error) => {
                console.log(error);
            })

        self.getDocs();    

        // GetDocs every 5 seconds
        setInterval(() => {
            self.getDocs();
        }, 5000);


        
    }

    getDocs = () => {
        console.log('Getting Docs');

        let self = this;

        let url = self.state.selectedFolder ? process.env.API + '/doc/api/folder/' + self.state.selectedFolder : process.env.API + '/doc/api';

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

    docAction = (e) => {
        let self = this;
        if (self.state.selectedRows.length > 0) {

            if(e.target.value == 'convert') {

                // CONVERT

                console.log('Sending for conversion');
                self.setState({alert: {show: true, variant: 'success', message: 'Sending for conversion'}});


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
            if(e.target.value == 'extract') {
                
                // EXTRACT

                let alert = {
                    show: true,
                    variant: 'success',
                    message: 'Extracting Entities'
                }

                self.setState({alert: alert});

                var newFormData = new FormData();

                newFormData.append("docs", self.state.selectedRows.map(doc => doc.id).join(','));
                newFormData.append("action", "extract");
            
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

            if(e.target.value == 'move') {

                // MOVE

                self.showModal('move');
            }

            if(e.target.value == 'delete') {

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

        this.docActionRef.current.value = '';

    }

    onNameChange = (e) => {
        console.log(e);
    }

    selectFolder = (e) => {
        let self = this;
        e.target.value == 'all' ? self.setState({selectedFolder: undefined}) : self.setState({selectedFolder: e.target.value});
        self.getDocs();
    }
    
    showModal(form) {
        this.setState(
            {   
                showModal: true, 
                showUpload: form == 'upload' ? true : false, 
                showFolder: form == 'folder' ? true : false,
                showMoveDoc: form == 'move' ? true : false,
                showReferenceUpload: form == 'reference' ? true : false
            }
        );
    }

    render() {
        return (<section className="vh-100 pt-5">

            <Container fluid>
                <DexiAlert alert={this.state.alert} />
            </Container>

            <Container>

                <Row className="mb-2">
                    <Col>
                        <DropdownButton variant="primary" title="NEW" size="sm">
                            <Dropdown.Item onClick={() => this.showModal('upload')}>Document</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.showModal('folder')}>Folder</Dropdown.Item>
                            <Dropdown.Item onClick={() => this.showModal('reference')}>Reference</Dropdown.Item>
                        </DropdownButton>
                    </Col>
                    <Col md="auto">
                        <Form.Select size="sm" onChange={(e) => this.selectFolder(e)} className="animate__animated animate__fadeIn">
                            <option value="">All Folders</option>
                            {this.state.folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md="auto" >
                        <Form.Select size="sm" onChange={this.docAction} ref={this.docActionRef} className="animate__animated animate__fadeIn">
                            <option value="">Do something</option>
                            <option value="convert">Convert To Text</option>
                            <option value="extract">Extract Entities</option>
                            <option value="move">Move To Folder</option>
                            <option value="delete">Delete File</option>
                        </Form.Select>
                    </Col>
                    <Col md="auto">
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
                        <Modal.Title>{this.state.showUpload ? 'Upload Documents' : this.state.showFolder ? 'Create Folder' : this.state.showMoveDoc ? 'Move Document' : 'Upload Reference'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { this.state.showUpload && <Upload folders={this.state.folders} onHide={() => this.setState({showModal: false})} /> }
                        { this.state.showFolder && <Folder onHide={() => this.setState({showModal: false})} /> }
                        { this.state.showMoveDoc && <MoveDoc folders={this.state.folders} docs={this.state.selectedRows} onHide={() => this.setState({showModal: false})} /> }
                        { this.state.showReferenceUpload && <UploadReference /> }
                    </Modal.Body>
                    
                </Modal>

                

            </Container>

        </section>)

    }

}