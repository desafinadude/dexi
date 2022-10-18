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
import Accordion from 'react-bootstrap/Accordion';



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
                    cell: row => row.entity,
                    maxWidth: '300px'
                },
                {
                    name: 'Schema',
                    selector: row => row.schema,
                    cell: row => <div className={'DexiBadge highlight highlight-' + row.schema}>{row.schema}</div>,
                    maxWidth: '120px'
                },
                {
                    name: 'Documents',
                    selector: row => row.found,
                    cell: row => {
                        let docs = [];
                        row.found.forEach((f) => 
                        {
                            docs.push(
                                <div key={'doc-' + row.id + f.doc.id}><a className="text-decoration-none" href={'/doc/' + f.doc.id}>{f.doc.name}</a> {f.page.join(',')}</div>
                            )
                        })
                        return (<Accordion flush style={{background: 'transparent'}}>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Found in <Badge className="mx-1">{docs.length}</Badge> Documents</Accordion.Header>
                                <Accordion.Body>{docs}</Accordion.Body>
                            </Accordion.Item>
                        </Accordion>);
                    },
                    
                    maxWidth: '300px'
                },
                {
                    name: 'Folders',
                    selector: row => row.found,
                    cell: row => {
                        let folders = [];
                        let foldersShow = [];
                        row.found.forEach((f) => 
                        {
                            if(folders.find(folder => folder.id === f.doc.folder.id) == undefined) {
                                folders.push(f.doc.folder)
                            }
                        })
                        folders.forEach((folder) => {
                            foldersShow.push(
                                <Badge bg="info" className="me-1">{folder.name}</Badge>
                            )
                        })

                        return foldersShow;
                    }
                }

            ],
            folders: [],
            entities: [],
            selectedRows: [],
        }
        
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

        

        // Get Entity List
        axios.get(process.env.API + '/entity/api', { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {

                console.log(response);

                let entities = [];
                
                response.data.forEach((entity) => {
                    
                    if(entities.find(e => e.entity === entity.entity) == undefined) {
                        entities.push({
                            entity: entity.entity,
                            schema: entity.schema,
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
                        } else {
                            if(entities.find(e => e.entity === entity.entity).found.find(f => f.doc.id === entity.doc.id).page.indexOf(entity.page) == -1) {
                                entities.find(e => e.entity === entity.entity).found.find(f => f.doc.id === entity.doc.id).page.push(entity.page)
                            }
                        }
                    }

                        
                
                })

                self.setState({entities: entities, pending: false});




            })
            .catch((error) => {
                console.log(error);
            })
    }


    render() {
        return (

            <Container className="my-4">

               
                <Row className="mb-2">
                    <Col md="auto">
                        <Form.Select size="sm" onChange={(e) => this.selectFolder(e)}>
                            <option value="">All Folders</option>
                            {this.state.folders.map((folder) => (
                                <option key={folder.id} value={folder.id}>{folder.name}</option>
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
                />

            </Container>

        )

    }

}