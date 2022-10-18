import React from 'react';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import { isTokenSet } from '../utils/utils';

export class DexiAlert extends React.Component {


    constructor(){
        super();
        this.state = {
            alert: {
                show: false,
                message: '',
                variant: ''
            }
        }
    }

    componentDidMount() {
        this.setState({alert: this.props.alert});
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if(this.props.alert != prevProps.alert) {
            return true;
         } else {
            return null;
         }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot == true) {
            this.setState({alert: this.props.alert});
        }
    }

    render() {
        return (
            <>
                {this.state.alert.show &&
                    <Alert variant={this.state.alert.variant} onClose={() => this.setState({alert: {show: false}})} dismissible>{this.state.alert.message}</Alert> 
                }
            </>
        )
    }

}