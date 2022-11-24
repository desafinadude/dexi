import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie, schemasLookup } from '../utils/utils';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/esm/Badge';


export class MergeEntity extends React.Component {

    constructor() {
        super();
        this.state = {
            preventMerge: false
        }
    }

    componentDidMount() {
        let self = this;
        
        self.props.entities.forEach(entity => {
            if (entity.mergedEntities.length > 0) {
                self.setState({preventMerge: true});
            }
        })
        
    }

    onFormSubmit = (e) => {

        let self = this;

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("prefer", formDataObj.prefer);
        newFormData.append("entities", self.props.entities.map(entity => entity.id).join(','));

        axios.post(process.env.API + '/dexi/entity/merge/' , newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            console.log(response);
            if(response.status == 200) {
                self.props.onHide();
                self.props.onMerge();
            }
        })
        .catch((error) => {
            alert(error.message);
        })

    }

    

    render() {
        return (
            <>

                {
                    this.state.preventMerge ?
                    <div className="alert alert-danger" role="alert">
                        One or more of the selected entities has already been merged. This is not supported <strong>YET</strong>. Please select another entity.
                    </div>
                    :

                    <Form onSubmit={this.onFormSubmit}>
                        <Row>
                            <Col>
                                <h6>Entities</h6>
                                {this.props.entities.map((entity, index) => {
                                    return (
                                        <Badge className="me-1" key={entity.id}>{entity.entity}</Badge>
                                    )
                                })}
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col>
                                <h6>Prefer</h6>
                                <Form.Select name="prefer" size="sm">
                                    {
                                    this.props.entities.map(entity => {
                                        return <option key={entity.id} value={entity.id}>{entity.entity}</option>
                                    })}
                                </Form.Select>
                            </Col>
                        </Row>
                        
                        <Button className="mt-4" variant="primary" size="sm" type="submit">Merge</Button>
                    </Form>
            }
           </>

        )
    }

}