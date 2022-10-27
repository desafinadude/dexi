import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';


import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export class Extract extends React.Component {

    
    onFormSubmit = (e) => {

        let self = this;

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("name", formDataObj.name);
        newFormData.append("description", formDataObj.description);
        newFormData.append("action", "new");

        axios.post(process.env.API + '/entity/api', newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {



            self.startExtraction(response.data.id);











        })
        .catch((error) => {
            console.log(error);
            alert(error.message);
        })

    }


    startExtraction = (extraction_id) => {
        
        let self = this;

        if(self.props.docs.filter(doc => doc.status >= 4).length > 0) {
                self.setState({alert: {show: true, variant: 'danger', message: 'Some documents are already extracted'}});
            } else if(self.props.docs.filter(doc => doc.status <= 2).length > 0) {
                self.setState({alert: {show: true, variant: 'danger', message: 'Some documents have not been converted to text'}});
            }  else {

                // EXTRACT

                // let alert = {
                //     show: true,
                //     variant: 'success',
                //     message: 'Extracting Entities'
                // }

                // self.setState({alert: alert});

                var newFormData = new FormData();

                newFormData.append("docs", self.props.docs.map(doc => doc.id).join(','));
                newFormData.append("extraction_id", extraction_id);
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
    
    
    }

    render() {
        return (
        
        

        <Form onSubmit={this.onFormSubmit}>
            
            {this.props.selectedProject}

            <Form.Control name="name" type="text" size="sm" placeholder="Extraction Name" />
            <Form.Control name="description" as="textarea" rows={3} placeholder="Extraction Description" className="mt-2"/>
        
            <Button className="mt-4" variant="primary" size="sm" type="submit">Start</Button>
                
        </Form>

        )
    }

}