import React from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import axios from "axios";

import { getCookie, isTokenSet } from '../utils/utils';

export class Notifications extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        messages: {
            user: null,
            status: null
        },
    };
  }

    componentDidMount() {

        let self = this;

        if (isTokenSet()) {
            this.timer = setInterval(() => {
                self.getNotifications();
            }, 5000);
        }

    }

    componentWillUnMount() {
        clearInterval(this.timer);
      }
   
  
  getNotifications = () => {
    let self = this;

    axios.get(process.env.API + '/dexi/notifications/', { headers: {
        "Authorization": "token " + getCookie('dexitoken')
    }})
    .then((response) => {
        let messsages = {
            user: response.data[0],
            status: response.data[1]
        }
        self.setState({messages: messsages});
    })
    .catch((error) => {
        console.log(error);
    })

  }
  
  render() {
    return (
        <div className='notifications-panel'>
            <Row>
                <Col>
                   { this.state.messages.user }
                </Col>
                <Col xs="auto">
                    {
                        this.state.messages.status != null && (this.state.messages.status == 1 ? <Badge bg="danger" size="sm">BUSY</Badge> : <Badge bg="success">NO CURRENT TASKS</Badge>) 
                    }
                </Col>
            </Row>
        </div>
    );
  }
}