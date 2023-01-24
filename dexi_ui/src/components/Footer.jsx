import React from 'react';
import Container from 'react-bootstrap/Container';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { isTokenSet, getCookie, schemasLookup } from '../utils/utils';
export class Footer extends React.Component {

    constructor(){
        super();
        this.state = {
        }
    }

    render() {
        return (
            <>
                <footer>
                    <Container className="py-4">
                        <p className="my-3 text-center text-light mb-5">&copy; 2022 OpenUp</p>
                    </Container>
                </footer>
            </>
        )
    }
}