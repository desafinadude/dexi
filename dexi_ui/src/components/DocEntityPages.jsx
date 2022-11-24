import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';

import Badge from 'react-bootstrap/Badge';
import { mdiTempleHindu } from '@mdi/js';


export class DocEntityPages extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    componentDidMount() {
        
    }

    runCallback = (cb) => {
        return cb();
    };

    render() {


        return (
               
            <div className="ms-5 me-auto py-2">
                {
                    this.props.entity.pages ? this.props.entity.pages.map((page, index) => {
                        return (
                            <Badge key={index} variant="light" className="me-2">
                                {page}
                            </Badge>
                        )
                    }) : <Badge variant="light" className="me-2">{this.props.entity.page}</Badge>
                }                   
            </div>
                               
        )
    }

        
}
