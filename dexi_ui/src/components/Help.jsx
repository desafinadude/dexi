import React from 'react';


import Accordion from 'react-bootstrap/Accordion';

export class Help extends React.Component {


    constructor(){
        super();
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return (

            <Accordion flush>
                <Accordion.Item eventKey="0">
                    <Accordion.Header><span className="text-primary fw-bold">Starting a New Project</span></Accordion.Header>
                    <Accordion.Body>
                        <p>Use the <strong>New Project</strong> button to start a new project.
                        A project could be a grouping of related documents and can have multiple extractions.</p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header><span className="text-primary fw-bold">Adding New Documents to a Project</span></Accordion.Header>
                    <Accordion.Body>
                        <p>Use the <strong>New Document</strong> button to add new documents to a project.
                        Dexi currently supports PDF, Docx, and plain text files.</p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header><span className="text-primary fw-bold">Preparing Documents for Extraction</span></Accordion.Header>
                    <Accordion.Body>
                        <p>Before entities can be extracted, a document needs to converted to plain text.</p>
                        <p>Select one or multiple documents and choose <strong>CONVERT TO TEXT</strong> from the <strong>Do Something</strong> dropdown button.</p>
                        <p>Documents may need to be processed with optical character recognition (PDF's) and this can take a while depending on the size of the document. Use the <strong>table refresh button</strong> to check the status.</p>
                        <p>Once the documents are marked as <strong>Ready</strong>, you can proceed with entity extraction.</p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                    <Accordion.Header><span className="text-primary fw-bold">Extracting Entities</span></Accordion.Header>
                    <Accordion.Body>
                        <p>Select the documents you would like to extract entities from and choose <strong>EXTRACT ENTITIES</strong> from the <strong>Do Something</strong> dropdown button.</p>
                        <p>This will start a new extraction.</p>
                        <p>Multiple extractions are possible and each extraction might use different language models or reference files.</p>
                        <p>Use the <strong>table refresh button</strong> to see document status.</p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="4">
                    <Accordion.Header><span className="text-primary fw-bold">Viewing and Working with Extractions</span></Accordion.Header>
                    <Accordion.Body>
                        <p>Switch to the <strong>Entities</strong> tab to see extractions for the current project.</p>
                        <p>Entities can be deleted, reclassified and merged.</p>
                        <p>For instance an extraction might include the term <strong>Zuma</strong> as well as <strong>Jacob Zuma</strong>. Merging these entities will join their count and treat them as a single term. </p>
                        <p>Entity Extraction is not an exact science and it often gets it wrong. You can reclassify entities if their detected schema is incorrect. A person for instance might have been detected as an organisation and this is easily fixed in the <strong>Edit Entity</strong> dialog.</p>
                        <p>Each entity can be expanded to see where the entity was found.</p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="5">
                    <Accordion.Header><span className="text-primary fw-bold">Working with Reference Lists</span></Accordion.Header>
                    <Accordion.Body>
                        <p>Natural Language Processing and entity Extraction is not always reliable and it can sometime be useful to provide a set of search terms instead.</p>
                        <p>Upload a <strong>CSV</strong> file with the following structure:</p>
                        <code>
                            <pre>
                                entity,schema<br/>
                                Zuma,PERSON<br/>
                                Eskom,ORG
                            </pre>
                        </code>
                        <p>When starting a new extraction, choose the reference file instead of a language model.</p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="6">
                    <Accordion.Header><span className="text-primary fw-bold">Quick Extract</span></Accordion.Header>
                    <Accordion.Body>
                        <p>Quick Extraction does not require any uploading of documents, but only works with raw text files. Simply enter a URL to a text file and extract.</p>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

        )
    }

                                 
      

}