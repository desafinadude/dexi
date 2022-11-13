import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';


import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export class Extract extends React.Component {

    constructor(){
        super();
        this.state = {
            references: [],
            extractor: 'nlp'
        }
    }

    componentDidMount() {
        let self = this;
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

    
    onFormSubmit = (e) => {

        let self = this;

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("name", formDataObj.name);
        newFormData.append("description", formDataObj.description);
        newFormData.append("extractor", self.state.extractor);
        newFormData.append("action", "new");

        axios.post(process.env.API + '/dexi/project/' + this.props.project.id + '/docs', newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            self.startExtraction(response.data.id);
        })
        .catch((error) => {
            alert(error.message);
        })

    }


    startExtraction = (extraction_id) => {

        let self = this;


        var newFormData = new FormData();

        newFormData.append("docs", self.props.docs.map(doc => doc.id).join(','));
        newFormData.append("extraction_id", extraction_id);
        newFormData.append("extractor", self.state.extractor);
        newFormData.append("action", "extract");

        axios.post(process.env.API + '/dexi/project/' + this.props.project.id + '/docs', newFormData, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                this.props.onHide();
                self.props.onSetAlert({
                        show: true,
                        variant: 'success',
                        message: 'Extracting Entities'
                    })
                console.log(response)
            })
            .catch((error) => {
                console.log(error);
            })

        
    
    
    }

    selectExtractor = (e) => {
        this.setState({extractor: e.target.value});
    }

    render() {
        return (
        
        

        <Form onSubmit={this.onFormSubmit}>
            
            {this.props.selectedProject}

            <Form.Control name="name" type="text" size="sm" placeholder="Extraction Name" />
            <Form.Control name="description" as="textarea" rows={3} placeholder="Extraction Description" className="mt-2"/>
            <Form.Select size="sm" onChange={(e) => this.selectExtractor(e)} className="mt-2">
                <option value="nlp">NLP - No Reference</option>
                {
                    this.state.references.map((reference, index) => {
                        return <option key={index} value={reference.id}>REFERENCE - {reference.name}</option>
                    })
                }
            </Form.Select>


            <Button className="mt-4" variant="primary" size="sm" type="submit">Start</Button>
                
        </Form>

        )
    }

}