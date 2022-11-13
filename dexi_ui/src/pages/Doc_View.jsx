import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { isTokenSet, getCookie, readSearchParams, schemasLookup } from '../utils/utils';
import { useParams } from 'react-router-dom';

import * as fs from 'fs';

import dayjs from 'dayjs';

import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Form from 'react-bootstrap/Form';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';


import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'

import '../../node_modules/react-reflex/styles.css';

import DataTable, { defaultThemes } from 'react-data-table-component';

import { MultiSelect } from "react-multi-select-component";

import parse from "html-react-parser";

import { Document, Page } from 'react-pdf/dist/esm/entry.parcel2';

import Icon from '@mdi/react';
import { mdiCalendarMonth, mdiFile, mdiFolder, mdiInformation } from '@mdi/js';
import { setFlagsFromString } from 'v8';

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}


export class DocView extends React.Component {

    constructor(){
        
        super()
        this.state = {
            tokenSet: false,
            doc: {},
            tab: 'text',
            text: '',
            highlightedText: '',
            columns: [
                {
                    name: 'Entity',
                    selector: row => row.entity,
                    cell: row => <strong>{row.entity}</strong>,
                    sortable: true
                },
                {
                    name: 'Count',
                    selector: row => row.found,
                    cell: row => row.found.length,
                    maxWidth: '20px',
                    sortable: true
                },
                // {
                //     name: 'Page',
                //     selector: row => row.found,
                //     cell: row => row.found.map(p => p.page).join(', '),
                //     maxWidth: '20px',
                // },
                {
                    name: 'Schema',
                    selector: row => row.schema,
                    cell: row => <div className={'DexiBadge highlight highlight-' + row.schema}>{row.schema}</div>,
                    maxWidth: '120px',
                    sortable: true
                },
            ],
            loading: true,
            project: {},
            entities: [],
            extractionEntities: [],
            extractions: [],
            selectedExtraction: undefined,
            pdf_pageNumber: 1,
            pdf_numPages: null,
            schemas: [
                { 
                    label: <div className="DexiBadge highlight highlight-PERSON">Person</div>,
                    value: 'PERSON'
                },
                {
                    label: <div className="DexiBadge highlight highlight-LOC">Location</div>,
                    value: 'LOC'
                },
                {
                    label: <div className="DexiBadge highlight highlight-ORG">Organization</div>,
                    value: 'ORG'
                },
                {
                    label: <div className="DexiBadge highlight highlight-GPE">Countries, Cities, States</div>,
                    value: 'GPE'
                },
                {
                    label: <div className="DexiBadge highlight highlight-NORP">Nationalities, Religious, and Political Groups</div>,
                    value: 'NORP'
                },
                {
                    label: <div className="DexiBadge highlight highlight-LAW">Legal documents</div>,
                    value: 'LAW'
                },
                {
                    label: <div className="DexiBadge highlight highlight-FAC">Facilities</div>,
                    value: 'FAC'
                },
                {
                    label: <div className="DexiBadge highlight highlight-PRODUCT">Products</div>,
                    value: 'PRODUCT'
                },
                {
                    label: <div className="DexiBadge highlight highlight-EMAIL">Emails</div>,
                    value: 'EMAIL'
                }
            ],
            selectedSchemas: [],
            selectedRows: [],
            
        }
        
    }

    componentDidMount() {

        let docId = window.location.href.split('/').pop();
        let projectId = readSearchParams().project[0];
        

        let self = this;

        if(isTokenSet()) {
            this.setState({tokenSet: true});
        } else {
            window.location.href='/';
        }

        axios.get(process.env.API + '/dexi/doc/' + docId, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({doc: response.data, selectedSchemas: self.state.schemas}, () => {
                    self.getProject(projectId);
                    self.getDocText();
                    self.getExtractions();
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    onDocumentLoadSuccess = ({ numPages }) => {
        let self = this;
        self.setState({ pdf_numPages: numPages });
    }

    previousPage = () => {
        let self = this;
        self.setState({pdf_pageNumber: self.state.pdf_pageNumber - 1});
    }

    nextPage = () => {
        let self = this;
        self.setState({pdf_pageNumber: self.state.pdf_pageNumber + 1});
    }

    getProject = (projectId) => {
        let self = this;
        axios.get(process.env.API + '/dexi/project/' + projectId, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({project: response.data});
            })
            .catch((error) => {
                console.log(error);
            })
    }


    getDocText() {
        let self = this;
        const file = self.state.doc.file + '.txt';
        
        axios.get(file)
            .then((response) => {

                let textParser = new DOMParser();
                
                let regex = /\/tmp\/[A-Za-z0-9\-._]+\/[A-Za-z0-9\-.]+_dexipage_[A-Za-z0-9\-.]+/g;

                let text = response.data;

                let convertedText = textParser.parseFromString(text.replaceAll(regex,"-------")
                .replaceAll('<','').replaceAll('>','').replaceAll('\n\n','<br/><br/>'),'text/html')
                .body.innerHTML;

                self.setState(
                    {
                        text: convertedText,
                        highlightedText: convertedText,
                    }
                );

                
            })
            .catch((error) => {
                console.log(error);
            })
        
    }

    highlightText = () => {
        let self = this;

        let highlightedText = self.state.text;

        self.state.extractionEntities.forEach((entity) => {

            let regex = new RegExp(`(?<!>)(${entity.entity})(?!<)`, 'g');

            highlightedText = highlightedText.replaceAll(regex, '<span class="highlight highlight-' + entity.schema + '">' + entity.entity + '</span>');
        })

        self.setState({highlightedText: highlightedText});
    
    }

    getExtractions = () => {
        let self = this;

        axios.get(process.env.API + '/dexi/doc/' + self.state.doc.id + '/extractions', { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState(
                    { 
                        extractions: response.data,
                        selectedExtraction: response.data[0].id
                    }, () => self.getEntities()
                );
            })
            .catch((error) => {
                console.log(error);
            })
    }


    getEntities = () => {

        let self = this;

        axios.get(process.env.API + '/dexi/doc/' + this.state.doc.id + '/entities', { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {

                let entities = [];

                for (let i = 0; i < response.data.length; i++) {
                    const entity = response.data[i];

                    entities.push({
                        id: entity.id,
                        entity: entity.entity.entity,
                        entity_id: entity.entity.id,
                        entity_schema: entity.entity.schema,
                        entity_extraction: entity.entity.extraction,
                        page: entity.page,
                        pos: entity.pos
                    })
                }

                
                let entitiesGrouped = [];

                entities.forEach((entity) => {

                    if(entitiesGrouped.find(e => e.id === entity.entity_id) === undefined) {
                        entitiesGrouped.push({
                            id: entity.entity_id,
                            entity: entity.entity,
                            schema: entity.entity_schema,
                            extraction: entity.entity_extraction,
                            found: [
                                {
                                    page: entity.page,
                                    pos: entity.pos
                                }
                            ]
                        })
                    
                    } else {

                        let currentEntity = entitiesGrouped.find(e => e.id === entity.entity_id);

                        if(currentEntity.found.find(f => f.page === entity.page) === undefined) {
                            currentEntity.found.push({
                                page: entity.page,
                                pos: entity.pos
                            });
                        }

                    }
                })

                self.setState({entities: entitiesGrouped}, () => self.filterEntitiesByExtraction());

            })
            .catch((error) => {
                console.log(error);
            })

    }

    filterEntitiesByExtraction = () => {

        let self = this;
        let extractionEntities = self.state.entities.filter(e => e.extraction === parseInt(self.state.selectedExtraction));

        self.setState(
            {
                extractionEntities: extractionEntities,
                loading: false
            },
            () => {
                self.highlightText()
            }
        );

        
    }

    setSchemas = (selectedSchemas) => {
        this.setState({selectedSchemas: selectedSchemas});
    }

    selectRows = ({ selectedRows }) => {
        let self = this;
        self.setState({selectedRows: selectedRows});
    }

    selectExtraction = (e) => {
        let self = this;
        self.setState({selectedExtraction: e.target.value, loading: true}, () => self.filterEntitiesByExtraction());
    }

    entityAction = (action) => {
        let self = this;

        if(action == 'delete') {

            self.setState({alert: {show: true, variant: 'success', message: 'Deleting'}});
            
            // DELETE

            var newFormData = new FormData();

            newFormData.append("entities", self.state.selectedRows.map(entity => entity.id).join(','));
            newFormData.append("action", "delete");

            axios.post(process.env.API + '/dexi/entity/delete', newFormData, { headers: {
                "Authorization": "token " + getCookie('dexitoken')
                }})
                .then((response) => {
                    self.setState({selectedRows: []});
                })
                .catch((error) => {
                    console.log(error);
                })

        }
    }
    
    

    render() {
        
    

        return (
            <>
                
                <Container fluid className="my-4 px-3">
                    <Row>
                        <Col>
                            <Breadcrumb>
                                <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                                <Breadcrumb.Item href="/project">Projects</Breadcrumb.Item>
                                { this.state.project &&
                                    <Breadcrumb.Item href={`/project/${this.state.project.id}`}>{this.state.project.name}</Breadcrumb.Item>
                                }
                                <Breadcrumb.Item active>{this.state.doc.name}</Breadcrumb.Item>
                            </Breadcrumb>
                        </Col>
                        <Col md="auto">
                            <Button variant="primary" size="sm" onClick={() => this.setState({showExtractionModal: true})}><Icon path={mdiInformation} size={0.9} /> </Button>
                        </Col>
                    </Row>
                </Container>
                
                <Container fluid className="px-3">

                    <Tabs activeKey={this.state.tab} onSelect={(k) => this.setState({tab: k})} className="mt-3">
                        
                        <Tab eventKey="pdf" title="Document" className="bg-white">
                            <Document file={this.state.doc.file} onLoadSuccess={this.onDocumentLoadSuccess}>
                                <Page pageNumber={this.state.pdf_pageNumber} width={800}/>
                            </Document>
                            <div className="text-center mt-2 mb-4">
                                <p>Page {this.state.pdf_pageNumber || (this.state.pdf_numPages ? 1 : '--')} of {this.state.pdf_numPages || '--'}</p>
                                <Button type="button" disabled={this.state.pdf_pageNumber <= 1} onClick={this.previousPage}>Previous</Button>
                                <Button type="button" disabled={this.state.pdf_pageNumber >= this.state.pdf_numPages} onClick={this.nextPage}>Next</Button>
                            </div>
                        </Tab>

                        <Tab eventKey="text" title="Text and Entities" className="bg-white">
                            
                            
                            <ReflexContainer orientation="vertical">

                                <ReflexElement className="left-pane" style={{height: '100%'}}>
                                    <div className="pane-content p-5" style={{fontFamily: 'courier', fontSize: '0.8em'}}>
                                        {parse(this.state.highlightedText)}
                                    </div>
                                </ReflexElement>

                                <ReflexSplitter style={{minHeight: '100vh'}}/>

                                <ReflexElement className="right-pane bg-light" style={{height: '100%'}}>
                                    <div className="pane-content p-3">
                                        <Row className="mb-2">
                                            <Col>
                                                {/* <MultiSelect
                                                    options={this.state.schemas}
                                                    value={this.state.selectedSchemas}
                                                    onChange={this.setSchemas}
                                                    labelledBy="Schemas"
                                                    className="mb-3"
                                                    disabled={this.state.loading}
                                                /> */}
                                                {this.state.extractionEntities.length} entities
                                            </Col>
                                            <Col md="auto">
                                                <Form.Select size="sm" onChange={(e) => this.selectExtraction(e)} className="animate__animated animate__fadeIn d-inline-block w-auto me-1 h-100">
                                                    {
                                                        this.state.extractions.map((extraction, index) => {
                                                            return <option key={index} value={extraction.id}>{extraction.name}</option>
                                                        })
                                                    }
                                                </Form.Select>
                                                <DropdownButton variant="primary" title="Do Something" size="sm" className="d-inline-block mx-1" disabled={this.state.selectedRows.length == 0 ? true : false}>
                                                    <Dropdown.Item onClick={() => this.entityAction('merge')}>Merge Entities</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => this.entityAction('delete')}>Delete Entity</Dropdown.Item>
                                                </DropdownButton>
                                            </Col>
                                        </Row>
                                        
                                        <DataTable
                                            columns={this.state.columns}
                                            data={this.state.extractionEntities}
                                            dense={true}
                                            progressPending={this.state.loading}
                                            selectableRows={true}
                                            onSelectedRowsChange={this.selectRows}
                                        />
                                    </div>
                                </ReflexElement>

                            </ReflexContainer>
                        
                            
                        </Tab>
                    </Tabs>

                    
                    
                </Container>
                
               
            </>
        )
    }

}

export default withParams(DocView);