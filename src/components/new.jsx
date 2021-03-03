import React from 'react';
import {Button, Modal, Form} from 'react-bootstrap';
import CutPoints from './cutPoints'
import axios from 'axios';

class New extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show: false,
      cutPoints: [],
      modelName: "vgg16",
      outputPoints: [-1]
    }
  }

  handleShow = e=>{
    this.setState({show: true})
  }  
  handleClose = e=>{
    this.setState({show: false})
  }
  updateCutPoints = (e)=>{
    console.log(e);
    this.state.cutPoints.push((parseInt(e)))
    this.setState({
      cutPoints: this.state.cutPoints.map(e=>{return e;})
    })
    console.log(this.state.cutPoints);
  };
  deleteCutPoint = (e) =>{
    console.log(e.target.value);
    this.setState({
      cutPoints: this.state.cutPoints.filter(c =>{
        return c != e.target.value;
      })
    })
  }
  deploy = (e)=>{
    console.log(this.state.cutPoints, this.state.modelName)
    var bodyFormData = new FormData();
    bodyFormData.append('model', this.state.modelName);
    bodyFormData.append('cut_points', this.state.cutPoints);
    bodyFormData.append('output_points', this.state.outputPoints);
    axios.post('http://dashboard.tesla.cs.nthu.edu.tw:32510/model', bodyFormData)
    .then(e=>{
      console.log(e);
    })
    .catch(e=>{
      console.log(e);
    })
  }

  render(){
    return (
      <div style={{margin: '10px'}}>
        <Button block variant='success' onClick={this.handleShow}>New</Button>
        <Modal show={this.state.show}>
          <Modal.Header closeButton>
            <Modal.Title>New Model</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="model.name">
                <Form.Label>Select model</Form.Label>
                <Form.Control as="select" onChange={e=>{this.setState({modelName: e.target.value})}}>
                  <option>vgg16</option>
                  <option>multitask</option>
                </Form.Control>
              </Form.Group>
                <CutPoints cutPoints={this.state.cutPoints} modelName={this.state.modelName} 
            deleteCutPoint={this.deleteCutPoint} updateCutPoints={this.updateCutPoints}/>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.deploy}>
              Deploy new model
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
};

export default New;