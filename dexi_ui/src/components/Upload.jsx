import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';


export class Upload extends React.Component {

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
        
        newFormData.append("folder", formDataObj.folder ? formDataObj.folder : 1);
        newFormData.append("action", "upload");

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

        return (
            <div className="bg-white p-10 mt-5">
                <form onSubmit={this.onFormSubmit}>
                    <select name="folder">
                        <option>Select a Folder</option>
                        <>
                            { this.props.folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                        </>
                        
                    </select><br/>
                    <input name="file" multiple={true} type="file" onChange={(e) => this.showFiles(e) }/><br/>
                    <button className="btn-primary" type="submit">Submit</button>
                </form>
            </div>
        )
    }

}