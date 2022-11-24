import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';

import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import { mdiConsoleLine } from '@mdi/js';


export class EntityPages extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            count: 1,
            entity: {},
            theDocs: {},
            loading: true
        }
    }

    componentDidMount() {

        let self = this;


        let entityIds = [];

        entityIds.push(self.props.entity.data.id);
        
        if(self.props.entity.data.mergedEntities.length > 0) {
            self.props.entity.data.mergedEntities.forEach((e) => {
                entityIds.push(e.id);
            })
        }
        

        let thedocs = {};

        

        for(let i = 0; i < entityIds.length; i++) {

            axios.get(process.env.API + '/dexi/entity/' + entityIds[i], { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {

                for (let ii = 0; ii < response.data.length; ii++) {

                    const doc = response.data[ii].doc.id;
                    
                    if (thedocs.hasOwnProperty(doc)) {
                        thedocs[doc].push(response.data[ii]);
                    }
                    else {
                        thedocs[doc] = [];
                        thedocs[doc][0] = response.data[ii];
                    }
                }

            })
            .catch((error) => {
                console.log(error);
            }).then(() => {
                self.setState({theDocs: thedocs, loading: false})
            })
            

        }
        
       
            
    }

    runCallback = (cb) => {
        return cb();
    };

    render() {


        return (
            <>
            { 
                this.state.loading ? <div className="ms-5 me-auto py-3 fw-bold">LOADING Pages...</div>
                    :
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
            }
            </>
        )
    }

        
}
