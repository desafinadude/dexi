import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import axios from 'axios';

import { isTokenSet, getCookie, schemasLookup } from '../utils/utils';


export class Footer extends React.Component {


    constructor(){
        super();
        this.state = {
            
            
        }
        
    }

    componentDidMount() {
        let self = this;

        let notifications = new EventSource(process.env.API + '/dexi/notifications/')

        notifications.addEventListener('1', function(e) {
            console.log(e.data);
        }, false);
        
        notifications.addEventListener('open', function(e) {
            console.log("Connection was opened.");
        }, false);
        
        notifications.addEventListener('error', function(e) {
        if (e.readyState == EventSource.CLOSED) {
            console.log("Connection was closed.");
        }
        }, false);
        




    }

    getNotifications() {
        let self = this;

        // axios.post(process.env.API + '/dexi/notifications/1', 'no', { headers: {
        //     "Authorization": "token " + getCookie('dexitoken')
        //     }
        // })
        // .then((response) => {
        //     console.log(response);
        // })
        // .catch((error) => {
        //     console.log(error);
        // })

        // axios.get(process.env.API + '/dexi/notifications/1', { headers: {
        //     "Authorization": "token " + getCookie('dexitoken')
        //     }
        // })
        // .then((response) => {
        //     console.log(response);
        // })
        // .catch((error) => {
        //     console.log(error);
        // })

    }

    render() {
        return (
            <footer>
                <Container className="py-4">
                    <Nav className="justify-content-center">
                        <Nav.Item>
                            <Nav.Link href="/" className="link-light">Home</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/login" className="link-light">Login</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/about" className="link-light">How it Works</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    
                    <p className="mt-3 text-center text-light">&copy; 2022 OpenUp</p>
                    
                </Container>
            </footer>
        )
    }

}