import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';

import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';


export class EntityPages extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            count: 1,
            entity: {},
            theDocs: {}
        }
    }

    componentDidMount() {
        let self = this;
        self.setState({entity: this.props.entity.data}, () => {
            axios.get(process.env.API + '/dexi/entity/' + this.props.entity.data.id, { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                
                let thedocs = {};

                for (let i = 0; i < response.data.length; i++) {

                    const doc = response.data[i].doc.id;
                    
                    if (thedocs.hasOwnProperty(doc)) {
                        thedocs[doc].push(response.data[i]);
                    }
                    else {
                        thedocs[doc] = [];
                        thedocs[doc][0] = response.data[i];
                    }
                }

                self.setState({theDocs: thedocs});

            })
            .catch((error) => {
                console.log(error);
            })
        })
    }

    runCallback = (cb) => {
        return cb();
    };

    render() {


        return (
            <ListGroup as="ol" variant="flush" className="entityDetails py-3">
                <>
                {
                    this.runCallback(() => {
                        let listgroups = [];
                        for (const key in this.state.theDocs) {
                            listgroups.push(<ListGroup.Item as="li" key={key}>
                                <div className="ms-5 me-auto">
                                    <div className="fw-bold"><a className="text-decoration-none" href={'/doc/' + this.state.theDocs[key][0].doc.id + '?project=' + this.props.project}>{this.state.theDocs[key][0].doc.name}</a>&nbsp;&nbsp;</div>
                                    <>
                                    {
                                        this.runCallback(() => {
                                            let thePages = [];
                                            return this.state.theDocs[key].map((p) => {
                                                if(!thePages.includes(p.page)) {
                                                    thePages.push(p.page);
                                                    return <Badge key={p.page} className="me-1" variant="info">{p.page}</Badge>
                                                }
                                            })
                                        })
                                    }
                                    </>
                                </div>
                            </ListGroup.Item>)

                                
                        }
                        return listgroups;
                    })
                }
                </>
            </ListGroup>
        )
    }

        
}
