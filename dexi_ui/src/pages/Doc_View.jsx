import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { isTokenSet, getCookie, readSearchParams, schemasLookup, schemaColors } from '../utils/utils';
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
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Badge from 'react-bootstrap/Badge';
import Modal from 'react-bootstrap/Modal';

import TagCloud from 'react-tag-cloud';

import { DocEntityPages } from '../components/DocEntityPages';
import { MergeEntity } from '../components/MergeEntity';
import { EditEntity } from '../components/EditEntity';

import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'

import '../../node_modules/react-reflex/styles.css';

import DataTable, { defaultThemes } from 'react-data-table-component';

import { MultiSelect } from "react-multi-select-component";

import parse from "html-react-parser";

import { Document, Page } from 'react-pdf/dist/esm/entry.parcel2';

import Icon from '@mdi/react';
import { mdiCalendarMonth, mdiConsoleNetwork, mdiConsoleNetworkOutline, mdiFile, mdiFolder, mdiInformation } from '@mdi/js';
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
                    selector: row => row.entity_count,
                    cell: row => row.entity_count,
                    maxWidth: '20px',
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
                    name: 'Merged',
                    selector: row => row.mergedEntities.length,
                    cell: row => row.mergedEntities.length > 0 ? <OverlayTrigger placement="top" overlay={
                        <Tooltip>{row.mergedEntities.map((entity,index) => entity.entity).join(', ')}</Tooltip>
                    }><Badge>{row.mergedEntities.length}</Badge>
                    </OverlayTrigger> : '',
                    maxWidth: '100px',
                    center: true,
                    sortable: true
                }
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
            selectedEntitiesRows: [],
            showModal: false,
            showEntityEdit: false,
            showMergeEntity: false
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

        self.state.highlightEntities.forEach((entity) => {

            let regex = new RegExp(`(?<!>)(${entity.entity})(?!<)`, 'g');

            let preferredSchema = entity.preferredSchema ? entity.preferredSchema : entity.schema;

            highlightedText = highlightedText.replaceAll(regex, '<span class="highlight highlight-' + preferredSchema + '">' + entity.entity + '</span>');
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

                self.setState({entities: response.data}, () => self.filterEntitiesByExtraction());


            })
            .catch((error) => {
                console.log(error);
            })

    }

    filterEntitiesByExtraction = () => {

        let self = this;

        let extractionEntities = self.state.entities.filter(e => parseInt(e.extraction_id) === parseInt(self.state.selectedExtraction));

        let entityIds = [];
        

        for (var i=extractionEntities.length-1; i>=0; i--){
            let entity = extractionEntities[i];
            let index = i
       

            entity.id = entity.entity_id;
            entity.pages = [];
            entity.pages.push(entity.page)

            if(entityIds.includes(entity.entity_id)) {

                // this entity has already been added to the array, so we need to merge it with the existing entity and then remove it
                let existingEntity = extractionEntities.find(e => e.entity_id === entity.entity_id);
                existingEntity.entity_count = parseInt(existingEntity.entity_count) + parseInt(entity.entity_count);
            
                // add the page to the existing entity if it doesn't already exist
                if(!existingEntity.pages.includes(entity.page)) {
                    existingEntity.pages.push(entity.page);
                }

                // Sort the pages
                existingEntity.pages.sort((a, b) => a - b);

                // This is why we're looping in reverse - we need to remove the entity from the array
                extractionEntities.splice(index, 1);


            } else {
                entityIds.push(entity.entity_id);
            }
             
        }

        
        


        let mergedEntities = extractionEntities.filter(entity => entity.prefer == null);

        mergedEntities.forEach(entity => {
            entity.mergedEntities = extractionEntities.filter(mergedEntity => mergedEntity.prefer == entity.entity_id);

            // This adds the related entities counts to the preffered entity count
            if (entity.mergedEntities.length > 0) {
                entity.mergedEntities.forEach(mergedEntity => {
                    entity.entity_count += mergedEntity.entity_count;
                    
                    mergedEntity.pages.forEach(page => {
                        if(!entity.pages.includes(page)) {
                            entity.pages.push(page);
                        }
                    })

                    entity.pages.sort((a, b) => a - b);


                    
                })
            }
        })

        let flatEntities = [];

        let mergedEntitiesWork = [...mergedEntities];

        mergedEntitiesWork.forEach(entity => {
            flatEntities.push(entity);
            entity.mergedEntities.forEach(mergedEntity => {
                mergedEntity.preferredSchema = entity.schema;
                flatEntities.push(mergedEntity);
            })
            
        })

        console.log(flatEntities);





        self.setState(
            {
                extractionEntities: mergedEntities,
                highlightEntities: flatEntities,
                loading: false
            },
            () => {
                self.setCloud();
                self.highlightText()
            }
        );
    }

    setCloud = () => {
        let self = this;

        let cloud = [];
        
        self.state.extractionEntities.forEach((entity) => {
            cloud.push({
                text: entity.entity,
                value: entity.entity_count,
                schema: entity.schema
            })
        })
        
        self.setState({cloud: cloud});
    }



    setSchemas = (selectedSchemas) => {
        this.setState({selectedSchemas: selectedSchemas});
    }

    selectEntitiesRows = ({ selectedRows }) => {
        let self = this;
        self.setState({selectedEntitiesRows: selectedRows});
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

            newFormData.append("entities", self.state.selectedEntitiesRows.map(entity => entity.entity_id).join(','));
            newFormData.append("action", "delete");

            axios.post(process.env.API + '/dexi/entity/delete/', newFormData, { headers: {
                "Authorization": "token " + getCookie('dexitoken')
                }})
                .then((response) => {
                    self.setState({selectedRows: []});
                    self.getEntities();
                })
                .catch((error) => {
                    console.log(error);
                })

        }
    }

    mergedEntities = () => {
        let self = this;
        self.setState({alert: {show: true, variant: 'success', message: 'Entities Merged'}});
        self.getEntities();
    }

    showModal(form) {
        this.setState(
            {   
                showModal: true, 
                showEntityEdit: form == 'editEntity' ? true : false,
                showMergeEntity: form == 'mergeEntity' ? true : false
            }
        );
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
                        
                        { this.state.doc.type == 'application/pdf' &&
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
                        }   

                        <Tab eventKey="text" title="Text and Entities" className="bg-white">
                            
                            
                            <ReflexContainer orientation="vertical">

                                <ReflexElement className="left-pane" style={{height: '100%'}}>
                                    <div className="pane-content p-5" style={{fontFamily: 'courier', fontSize: '0.8em'}}>
                                        {parse(this.state.highlightedText)}
                                    </div>
                                </ReflexElement>

                                <ReflexSplitter style={{minHeight: '100vh'}}/>

                                <ReflexElement className="right-pane bg-light" style={{height: '100%'}}>

                                    { this.state.extractions.length > 0 ?

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
                                                    <DropdownButton variant="primary" title="Do Something" size="sm" className="d-inline-block mx-1" disabled={this.state.selectedEntitiesRows.length == 0 ? true : false}>
                                                        <Dropdown.Item disabled={this.state.selectedEntitiesRows.length < 2 ? true : false} onClick={() => this.showModal('mergeEntity')}>Merge Entities</Dropdown.Item>
                                                        <Dropdown.Item disabled={this.state.selectedEntitiesRows.length > 1 ? true : false} onClick={() => this.showModal('editEntity')}>Edit Entity</Dropdown.Item>
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
                                                    onSelectedRowsChange={this.selectEntitiesRows}
                                                    expandableRows={true}
                                                    expandableRowsComponent={row => <DocEntityPages entity={row.data}/>}
                                                />
                    
                                        </div>
                                        :
                                        <div className="pane-content p-5 text-center">
                                            <p>No extractions found.<br/>Go back to the <a href={`/project/${this.state.project.id}`}>project page</a> to start a new extraction.</p>
                                        </div>
                                    }

                                    </ReflexElement>

                            </ReflexContainer>
                        
                            
                        </Tab>
                        <Tab eventKey="viz" title="Viz" className="bg-white">
                            <TagCloud 
                                style={{
                                    fontFamily: 'sans-serif',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    fontStyle: 'italic',
                                    padding: 4,
                                    width: '100%',
                                    height: '300px'
                                }}>
                                {this.state.extractionEntities.map((entity, index) => {
                                    return <div key={index} className={'text-color-' + entity.schema} style={{fontSize: ((entity.entity_count - 1) / (16-1) * 36) + 16}}>{entity.entity}</div>
                                })}
                                
                            </TagCloud>
                        </Tab>
                    </Tabs>

                    
                    
                </Container>

                <Modal centered show={this.state.showModal} onHide={() => this.setState({showModal: false})}>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.showEntityEdit ? 'Edit Entity' : this.state.showMergeEntity ? 'Merge Entities' : ''}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        { this.state.showEntityEdit && <EditEntity onHide={() => this.setState({showModal: false})} entity={this.state.selectedEntitiesRows} onGetEntities={() => this.getEntities()} /> }

                        { this.state.showMergeEntity && <MergeEntity onHide={() => this.setState({showModal: false})} entities={this.state.selectedEntitiesRows} onMerge={() => this.mergedEntities()} /> }
                    </Modal.Body>
                    
                </Modal>
                
               
            </>
        )
    }

}

export default withParams(DocView);