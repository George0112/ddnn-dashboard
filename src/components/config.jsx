import React from 'react';
import {Row, Col, ButtonGroup, Button, Modal, Fade} from 'react-bootstrap';

class Config extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show: false,
    }
  };

  handleShow = () => {
    this.setState({show: true});
  };

  handleClose = () => {
    this.setState({show: false});
  };

  render(){

    return(
      <div className='justify-content-end'>
        <Button className='float-right' variant="primary" onClick={this.handleShow}>
          Config
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.modelName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>Body</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default Config;