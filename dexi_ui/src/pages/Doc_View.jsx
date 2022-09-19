import React, { Component } from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';
import { useParams } from 'react-router-dom';


import { Document, Page } from 'react-pdf/dist/esm/entry.parcel2';

function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
}


export class DocView extends React.Component {

    constructor(){
        
        super()
        this.state = {
            tokenSet: false,
            doc: {}
        }
        
    }

    componentDidMount() {

        // let { docId } = this.props.params;
        let docId = 1;
        console.log(this)

        let self = this;


        if(isTokenSet()) {
            this.setState({tokenSet: true});
        }

        axios.get(process.env.API + '/doc/api/' + docId, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                console.log(response);
                self.setState({doc: response.data})
            })
            .catch((error) => {
                console.log(error);
            })
    }

    // getSnapshotBeforeUpdate(prevProps, prevState) {
    //     if(this.props.a != prevProps.a || this.props.b.length != prevProps.b.length) {
    //         return true;
    //      } else {
    //         return null;
    //      }
    // }
    // componentDidUpdate(prevProps, prevState, snapshot) {
    //     if (snapshot == true) {
            
    //     }
    // }

    render() {
        


        return (
            <>
                <Document file={this.state.doc.file}>
                    <Page pageNumber={1}/>
                </Document>
               
            </>
        )
    }

}

export default withParams(DocView);