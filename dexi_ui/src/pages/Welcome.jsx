import React from 'react';
import { isTokenSet } from '../utils/utils';

export class Welcome extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false
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

    render() {
        return (<>
        {this.state.tokenSet ? 
            
        <section className="h-screen bg-cyan-600">


            <h1>Welcome to...</h1>
            <img src="./Dexi.png"/>
        </section>           
        
        : <div>Redirecting...</div>}
        </>)
    }

}