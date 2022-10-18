import React, { Component } from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';
import { useParams } from 'react-router-dom';

import * as fs from 'fs';

import Container from 'react-bootstrap/Container';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import DataTable, { defaultThemes } from 'react-data-table-component';

import parse from "html-react-parser";

import { Document, Page } from 'react-pdf/dist/esm/entry.parcel2';

import Icon from '@mdi/react';
import { mdiCalendarMonth, mdiFile, mdiFolder } from '@mdi/js';

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}


export class DocView extends React.Component {

    constructor(){
        
        super()
        this.state = {
            tokenSet: false,
            doc: {},
            tab: 'pdf',
            text: '',
            columns: [
                {
                    name: 'entity',
                    selector: row => row.entity,
                },
                {
                    name: 'pages',
                    selector: row => row.page,
                },
                {
                    name: 'pos',
                    selector: row => row.pos,
                },
                {
                    name: 'Schema',
                    selector: row => row.schema,
                    maxWidth: '50px'
                },
            ],
            entities: [],
            pdf_pageNumber: 1,
            pdf_numPages: null,
        }
        
    }

    componentDidMount() {

        let docId = window.location.href.split('/').pop();

        let self = this;

        if(isTokenSet()) {
            this.setState({tokenSet: true});
        }

        axios.get(process.env.API + '/doc/api/' + docId, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({doc: response.data}, () => {
                    console.log(response);
                    self.getEntities();
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


    getDocText() {
        let self = this;
        const file = self.state.doc.file + '.txt';
        
        axios.get(file)
            .then((response) => {
                let textParser = new DOMParser();
                let regex = /\/tmp\/[A-Za-z0-9\-._]+\/[A-Za-z0-9\-.]+_dexipage_[A-Za-z0-9\-.]+/g;

                let text = response.data;
                // let convertedText = text.replaceAll(regex,"-------");

                let convertedText = textParser.parseFromString(text.replaceAll(regex,"-------")
                    .replaceAll('\n','<br/>'),'text/html')
                    .body.innerHTML;

                let entities = self.state.entities;

                entities.forEach((entity) => {

                    let regex = new RegExp(`(?<!>)(${entity.entity})(?!<)`, 'g');

                    convertedText = convertedText.replaceAll(regex, '<span class="highlight highlight-' + entity.schema + '">' + entity.entity + '</span>');
                })
                self.setState({text: convertedText});



            })
            .catch((error) => {
                console.log(error);
            })
        
    }

    getEntities() {

        let self = this;

        axios.get(process.env.API + '/entity/api/doc/' + this.state.doc.id, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({entities: response.data});
                self.getDocText();
            })
            .catch((error) => {
                console.log(error);
            })

    }

    

    render() {
        
    

        return (
            <>
                <Container className="my-4">

                    <h2>{this.state.doc.name}</h2>
                    <ul class="docMeta">
                        <li><Icon path={mdiFile} size={0.7} color='#666'/> {this.state.doc.file}</li>
                        <li><Icon path={mdiCalendarMonth} size={0.7} color='#666'/> {this.state.doc.created_at}</li>
                        <li><Icon path={mdiFolder} size={0.7} color='#666'/> </li>
                    </ul>

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

                        <Tab eventKey="text" title="Text" className="bg-white p-5">
                            <Row>
                                <Col md={8}>
                                    {parse(this.state.text)}
                                </Col>
                                <Col>
                                    <DataTable
                                        columns={this.state.columns}
                                        data={this.state.entities}
                                        dense={true}
                                        striped={true}
                                    />
                                </Col>
                            </Row>
                        </Tab>
                    
                    </Tabs>
                    
                </Container>
               
            </>
        )
    }

}

export default withParams(DocView);