import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { isTokenSet, getCookie, readSearchParams } from '../utils/utils';
import { useParams, Link } from 'react-router-dom';

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

import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'

import '../../node_modules/react-reflex/styles.css';

import DataTable, { defaultThemes } from 'react-data-table-component';

import parse from "html-react-parser";

import Icon from '@mdi/react';

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}


export class QuickExtract extends React.Component {

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
                    selector: row => row.pos,
                    cell: row => row.pos.length,
                    maxWidth: '20px',
                    sortable: true
                },
                {
                    name: 'Schema',
                    selector: row => row.schema,
                    cell: row => <div className={'DexiBadge highlight highlight-' + row.schema}>{row.schema}</div>,
                    maxWidth: '120px',
                    sortable: true
                },
            ],
            loading: false,
            entities: [],
            selectedSchemas: [],
            selectedRows: [],
            
        }
        
    }

    componentDidMount() {


        
    }


    onFormSubmit = (e) => {

        let self = this;

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("url", formDataObj.url);
        newFormData.append("action", "new");

        self.setState({loading: true});
        
        axios.post(process.env.API + '/dexi/extract/', newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            self.setState(
                {
                    text: response.data[1],
                    highlightedText: response.data[1], 
                    entities: response.data[0],
                    loading: false, 
                }, () => self.highlightText());
        })
        .catch((error) => {
            alert(error.message);
        })

    }

    
    

    

    highlightText = () => {
        let self = this;

        let highlightedText = self.state.text;

        self.state.entities.forEach((entity) => {

            let regex = new RegExp(`(?<!>)(${entity.entity})(?!<)`, 'g');

            highlightedText = highlightedText.replaceAll(regex, '<span class="highlight highlight-' + entity.schema + '">' + entity.entity + '</span>');
        })

        self.setState({highlightedText: highlightedText});
    
    }
    

    render() {
        
    

        return (
            <>
                
                <Container fluid className="my-4 px-3">

                    <Breadcrumb>
                        <Breadcrumb.Item linkAs="span"><Link to="/">Home</Link></Breadcrumb.Item>
                        <Breadcrumb.Item active>QuickExtract</Breadcrumb.Item>
                    </Breadcrumb>
                    
                </Container>
                
                <Container fluid className="px-3">

                    <Tabs activeKey={this.state.tab} onSelect={(k) => this.setState({tab: k})} className="mt-3">

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
                                        <Form onSubmit={this.onFormSubmit}>
                                            <Row className="mb-2">
                                                <Col>
                                                    <Form.Control type="text" name="url" placeholder="URL to a text file" />
                                                </Col>
                                                <Col sm="auto">
                                                    <Button variant="primary" type="submit">Extract</Button>
                                                </Col>
                                            </Row>
                                        </Form>
                                        <DataTable
                                            columns={this.state.columns}
                                            data={this.state.entities}
                                            dense={true}
                                            progressPending={this.state.loading}
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

export default withParams(QuickExtract);