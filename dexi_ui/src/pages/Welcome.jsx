import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

export class Welcome extends React.Component {


    constructor(){
        super();
        this.state = {
            tokenSet: false
        }
        
    }

    componentDidMount() {
        // if(isTokenSet()) {
        //     this.setState({tokenSet: true});
        // }
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

        <section className="vh-100 hero-section">
            <div className="h-100 hero-inner-bg" style={{backgroundImage: 'url("./books-bg.jpg")'}}>
                <Container>
                    <div className="text-center position-absolute" style={{'top': '50%', 'left': '50%', 'transform': 'translate(-50%,-50%)'}}>
                        <div>
                            <div className="d-inline-block bg-secondary fs-1 px-3 pt-2 text-white shadow-sm m-2" style={{'transform': 'rotate(-3deg)'}}>DYNAMIC</div>
                            <div className="d-inline-block bg-primary fs-1 px-3 pt-2 text-white shadow-sm" style={{'transform': 'rotate(2deg)'}}>ENTITY</div>
                        </div>
                        <div>
                            <div className="d-inline-block bg-info fs-1 px-3 pt-2 text-white shadow-sm m-2" style={{'transform': 'rotate(-3deg)'}}>EXTRACTION</div>
                            <div className="d-inline-block bg-dark fs-1 px-3 pt-2 text-white shadow-sm m-2" style={{'transform': 'rotate(4deg)'}}>&amp;</div>
                            <div className="d-inline-block bg-info fs-1 px-3 pt-2 text-white shadow-sm m-2" style={{'transform': 'rotate(6deg)'}}>INDEXING</div>
                        </div>
                    </div>
                </Container>
            </div>
        </section>

        <section className="py-5">
            <Container className="text-center pt-4">
                <h2 className="text-primary font-special-elite">DEXI LOVES DOCUMENTS</h2>
                <p>Here are some features blah blah blah</p>

                <Row className="py-5 text-start features-block justify-content-md-center">
                    <Col md={4}>
                        <Card className="mb-3 shadow-sm border-0 p-3">
                            <Card.Body className="text-center">
                                <h4 className="fs-5 font-special-elite bg-secondary d-inline-block pt-1 px-2 text-white">PDF TO TXT</h4>
                                <p>Upload your documents and turn them into searchable text.</p>
                            </Card.Body>
                        </Card>
                        <Card className="shadow-sm border-0 p-3">
                            <Card.Body className="text-center">
                                <h4 className="fs-5 text-primary font-special-elite bg-secondary d-inline-block pt-1 px-2 text-white">EXTRACT</h4>
                                <p>Extract named entities with natural language processing models.</p>
                            </Card.Body>
                        </Card>

                    </Col>
                    
                    <Col md={4}>
                        <Card className="mb-3 shadow-sm border-0 p-3">
                            <Card.Body className="text-center">
                                <h4 className="fs-5 text-primary font-special-elite bg-secondary d-inline-block pt-1 px-2 text-white">INDEXING</h4>
                                <p>Get an overview of your documents with detailed index building.</p>
                            </Card.Body>
                        </Card>
                        <Card className="shadow-sm border-0 p-3">
                            <Card.Body className="text-center">
                                <h4 className="fs-5 text-primary font-special-elite bg-secondary d-inline-block pt-1 px-2 text-white">COMPARING</h4>
                                <p>Upload custom lists to use as reference when indexing.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

            </Container>
        </section>
        
        
        </>)
    }

}