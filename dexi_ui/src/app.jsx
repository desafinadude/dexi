import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';

import { isTokenSet } from './utils/utils';

import './app.scss';
import 'animate.css';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Notifications } from './components/Notifications';

export class App extends React.Component {


    constructor(){
        super();
        this.state = {
            loggedIn: false
        }
        
    }

    // This is not great. Fix with hooks.
    onLogin = () => {
        this.setState({loggedIn: true});
    }    


    render() {
        return (
            <>
                <BrowserRouter>
                    <Header loggedIn={this.state.loggedIn} />
                    
                    <div>
                        <Router onLogin={this.onLogin}/> 
                    </div>
                    
                    <Footer />
                    
                    <Notifications loggedIn={this.state.loggedIn} />
                    
                </BrowserRouter>
            </>
        )
    }

}


const container = document.getElementsByClassName('app')[0];
const root = createRoot(container);
root.render(<App />);