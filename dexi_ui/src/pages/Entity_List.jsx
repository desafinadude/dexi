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
                    name: 'Folders',
                    selector: row => row.folders.length,
                    maxWidth: '100px',
                    center: true,
                    sortable: true
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

                

                let entities = [];
                
                response.data.forEach((entity) => {

                    // DOCUMENTS
                    
                    if(entities.find(e => e.entity === entity.entity) == undefined) {
                        entities.push({
                            entity: entity.entity,
                            schema: entity.schema,
                            count: 1,
                            folders: [],
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

                    // FOLDERS
                    if(entities.find(e => e.entity === entity.entity).folders.find(f => f.id === entity.doc.folder.id) == undefined) {
                        entities.find(e => e.entity === entity.entity).folders.push(entity.doc.folder)
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
                    expandableRows={true}
                    expandableRowsComponent={EntityDetails}
                    expandOnRowClicked={true}
                    expandOnRowDoubleClicked={false}
                    expandableRowsHideExpander={false}
                    pagination={false}
                />

            </Container>

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
                        <div className="fw-bold"><a className="text-decoration-none" href={'/doc/' + f.doc.id}>{f.doc.name}</a> <Badge bg="info">{f.doc.folder.name}</Badge>
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