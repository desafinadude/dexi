import React from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import { isTokenSet, getCookie } from '../utils/utils';


import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';


export class ExtractionDetails extends React.Component {

    constructor(){
        super();
        this.state = {
            extraction: {}
            
        }
    }

    componentDidMount() {
        let self = this;
        
        axios.get(process.env.API + '/dexi/extraction/' + this.props.extraction, { headers: {
                "Authorization": "token " + getCookie('dexitoken')
        }})
        .then((response) => {
            self.setState({ extraction: response.data })
        })
        .catch((error) => {
            console.log(error);
        })


    }

    deleteExtraction = () => {
        let self = this;
        axios.delete(process.env.API + '/dexi/extraction/' + this.props.extraction, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
        }})
        .then((response) => {
            self.props.onGetExtractions();
            self.props.onHide();

        })
    }
            
    

    render() {
        return (
            <>
                <dl>
                    <dt>Name:</dt>
                    <dd>{this.state.extraction.name}</dd>
                    <dt>Description:</dt>
                    <dd>{this.state.extraction.description}</dd>
                    <dt>Reference:</dt>
                    <dd>{this.state.extraction.reference ? this.state.extraction.reference : 'None'}</dd>
                    <dt>Created At:</dt>
                    <dd>{dayjs(this.state.extraction.created_at).format('DD-MM-YYYY')}</dd>
                </dl>
                <Button variant="danger" size="sm" onClick={this.deleteExtraction}>Delete Extraction</Button>
                <Button variant="primary" disabled size="sm" className="ms-1">Merge Extraction</Button>
            </>

        )
    }

}