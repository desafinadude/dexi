import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';


export class DocEdit extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false,
            filesToUpload: []
        }
        
    }

    componentDidMount() {
        if(isTokenSet()) {
            this.setState({tokenSet: true});
        }
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

    uploadFiles = (e) => {

        

        console.log(e);
        
        

    }

    showFiles = (e) => {
        this.setState({filesToUpload: e.target.files});
    }

    onFormSubmit = (e) => {

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        Array.from(this.state.filesToUpload).forEach(file => {
            newFormData.append("file", file);
        });

        
        newFormData.append("name", formDataObj.name);
        newFormData.append("folder", formDataObj.folder);

        axios.post(process.env.API + '/doc/api', newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log(error);
            alert(error.message);
        })

    }

    render() {
        return (<>
        
        <h2 className="text-center mb-5">Doc</h2>
        
        <form onSubmit={this.onFormSubmit}>
            
            <input name="name" type="text" size="lg" placeholder="Document Name" />
        
            <input name="folder" type="text" size="lg" placeholder="Folder" />
        
            <input name="file" type="file" size="lg" onChange={(e) => this.showFiles(e) }/>
        
            <button variant="primary" size="lg" type="submit">Submit</button>
              
        </form>

        </>)
    }

}