import React from 'react';
import axios from 'axios';

export class Login extends React.Component {


    constructor(){
        super();
        this.state = {
            
        }
        
    }

    componentDidMount() {
        
    }

    

    

    onFormSubmit = (e) => {

        e.preventDefault();

        let newFormData = new FormData();

        newFormData.append("username", 'admin');
        newFormData.append("password", 'admin');

        axios.post(process.env.API + '/login/', newFormData)
        .then((response) => {
            document.cookie = "dexitoken=" + response.data.token;
            window.location.href = "/doc";
        })

    }

    render() {
        return (<>
        
        <h2 className="text-center mb-5">Login</h2>
        
        <form onSubmit={this.onFormSubmit}>
            <input name="username" type="text" size="lg" placeholder="Username" />
            <input name="password" type="password" size="lg" placeholder="Password" />
            <button variant="primary" size="lg" type="submit">Login</button>
        </form>

        </>)
    }

}