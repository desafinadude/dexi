import React from 'react';
import axios from 'axios';

import { isTokenSet, getCookie } from '../utils/utils';


export class Folder extends React.Component {

    
    onFormSubmit = (e) => {

        e.preventDefault();
        
        const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries());
        
        var newFormData = new FormData();

        newFormData.append("name", formDataObj.name);

        axios.post(process.env.API + '/folder/api', newFormData,{ headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }
        })
        .then((response) => {
            window.location.href = "/folder";
        })
        .catch((error) => {
            console.log(error);
            alert(error.message);
        })

    }

    render() {
        return (<>
        
        <form onSubmit={this.onFormSubmit}>
            
            <input name="name" type="text" size="lg" placeholder="Folder Name" />
        
            <button variant="primary" size="lg" type="submit">Submit</button>
                
        </form>

        </>)
    }

}