import React from 'react';
import axios from 'axios';
import { isTokenSet, getCookie } from '../utils/utils';
import dayjs from 'dayjs';

import DataTable, { defaultThemes } from 'react-data-table-component';
import { Upload } from '../components/Upload';
import { Folder } from '../components/Folder';



export class DocList extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false,
            columns: [
                {
                    name: 'ID',
                    selector: row => row.id,
                    maxWidth: '20px'
                },
                {
                    name: 'Name',
                    selector: row => row.name,
                    cell: row => <span><a href={`/doc/${row.id}`}>{row.name}</a></span>
                },
                {
                    name: 'File',
                    selector: row => row.file,
                    cell: row => <span><a target="blank" href={row.file}>{row.file != null ? row.file.replace('https://dexi-storage.s3.amazonaws.com/','') : row.file}</a></span>
                },
                {
                    name: 'Folder',
                    selector: row => this.state.folders.find(folder => folder.id == row.folder).name,
                    maxWidth: '50px'
                },
                {
                    name: 'Created',
                    selector: row => row.created_at,
                    cell: row => dayjs(row.created_at).format('DD-MM-YYYY'),
                    maxWidth: '150px'
                },
                {
                    name: 'Status',
                    selector: row => row.status,
                    cell: row => <span>{row.status}</span>,
                    maxWidth: '150px'
                },

            ],
            docs: [],
            folders: [],
            selectedRows: [],
            showUpload: false,
            showFolder: false
        }
        
    }

    componentDidMount() {

        let self = this;


        if(isTokenSet()) {
            this.setState({tokenSet: true});
        }

        // Get Folders List
        axios.get(process.env.API + '/folder/api', { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({ folders: response.data })
            })
            .catch((error) => {
                console.log(error);
            })

        // Get Docs List
        axios.get(process.env.API + '/doc/api', { headers: {
            "Authorization": "token " + getCookie('dexitoken')
            }})
            .then((response) => {
                self.setState({ docs: response.data })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    selectRows = ({ selectedRows }) => {
        let self = this;
        self.setState({selectedRows: selectedRows});
    }

    docAction = (e) => {
        let self = this;
        if (self.state.selectedRows.length > 0) {
            
            // TODO: Delete and Move
            if(e.target.value == 'delete' || e.target.value == 'move') {
                alert('TODO: Delete and Move')
            } else {

                // CONVERT
                if(e.target.value == 'convert') {

                    var newFormData = new FormData();

                    newFormData.append("docs", self.state.selectedRows.map(doc => doc.id).join(','));
                    newFormData.append("action", "convert");

                    // console.log(...newFormData);
                
                    axios.post(process.env.API + '/doc/api', newFormData, { headers: {
                        "Authorization": "token " + getCookie('dexitoken')
                        }})
                        .then((response) => {
                            console.log(response)
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                }

                // EXTRACT
                else if(e.target.value == 'extract') {

                    console.log('Extracting Entities');

                    var newFormData = new FormData();

                    newFormData.append("docs", self.state.selectedRows.map(doc => doc.id).join(','));
                    newFormData.append("action", "extract");

                    // console.log(...newFormData);
                
                    axios.post(process.env.API + '/doc/api', newFormData, { headers: {
                        "Authorization": "token " + getCookie('dexitoken')
                        }})
                        .then((response) => {
                            console.log(response)
                        })
                        .catch((error) => {
                            console.log(error);
                        })
                }

            }

        } else {
            alert('No documents Selected');
        }
    }

    render() {
        return (<>
            <select onChange={this.docAction}>
                <option>Choose an Action</option>
                <option value="convert">Convert</option>
                <option value="extract">Extract</option>
                <option value="move">Move</option>
                <option value="delete">Delete</option>
            </select>
            <DataTable
                className="mt-5"
                columns={this.state.columns}
                data={this.state.docs}
                dense={false}
                striped={true}
                fixedHeader={true}
                highlightOnHover={false}
                selectableRows
                onSelectedRowsChange={this.selectRows}
            />
            <button className="mt-5 p-3" onClick={() => this.setState({showUpload: true})}>New Doc</button>&nbsp;
            <button className="mt-5 p-3" onClick={() => this.setState({showFolder: true})}>New Folder</button>
            

            {   this.state.showUpload ? <Upload folders={this.state.folders}/> : null   }
            {   this.state.showFolder ? <Folder /> : null   }

        </>)

    }

}