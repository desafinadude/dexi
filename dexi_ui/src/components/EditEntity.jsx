import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie, schemasLookup } from '../utils/utils';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export class EditEntity extends React.Component {

    constructor() {
        super();
        this.state = {
            entity: {},
            schemas: [],
            selectedSchema: 'PERSON',
        }
    }

    componentDidMount() {
        let self = this;
        let schemasList = [];
        const schemas = Object.keys(schemasLookup);
        schemas.forEach((key, index) => {
            schemasList.push({
                schema: key,
                description: schemasLookup[key]
            })
        });
        self.setState({ schemas: schemasList, selectedSchema: this.props.entity[0].schema });
        
    }

    onFormSubmit = (e) => {

        let self = this;

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("schema", formDataObj.schema);

        axios.put(process.env.API + '/dexi/entity/' + self.props.entity[0].id, newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            this.props.onHide();
            this.props.onGetEntities();
            this.props.onResetSelectedRows();
        })
        .catch((error) => {
            alert(error.message);
        })

    }

    selectSchema = (e) => {
        this.setState({ selectedSchema: e.target.value });
    }


    render() {
        return (
            <>
                {this.props.entity[0] &&
                    <Form onSubmit={this.onFormSubmit}>
                        <Row>
                            <Col>
                            <Form.Control name="entity" type="text" size="sm" disabled value={this.props.entity[0].entity} />
                            </Col>
                            <Col sm="auto">
                                <Form.Select name="schema" size="sm" onChange={e => this.selectSchema(e)} value={this.state.selectedSchema}>
                                    {
                                    this.state.schemas.map(schema => {
                                        return <option key={schema.schema} value={schema.schema}>{schema.schema}</option>
                                    })}
                                </Form.Select>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col>
                                { this.state.schemas.find(schema => schema.schema == this.state.selectedSchema) != undefined ?
                                    <small>{this.state.schemas.find(schema => schema.schema == this.state.selectedSchema).description}</small> : ''
                                }
                            </Col>
                        </Row>
                    
                        
                        <Button className="mt-4" variant="primary" size="sm" type="submit">Update</Button>
                    </Form>
                }
            </>

        )
    }

}