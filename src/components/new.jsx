import React from 'react';
import {Button, Modal, Form, Dropdown, DropdownButton, ButtonGroup} from 'react-bootstrap';
import CutPoints from './cutPoints'
import axios from 'axios';
import Const from './const';

class New extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show: false,
      cutPoints: [],
      devices: [],
      modelName: "vgg16",
      outputPoints: [-1],
      startFrom: "cloud"
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
    let cutPoint = parseInt(e.split('-')[0]);
    let device = e.split('-')[1];
    if(this.state.cutPoints.find(c => {return c.cutPoint == cutPoint})){
      this.state.cutPoints.forEach(c=>{
        if(c.cutPoint == cutPoint){
          c.device = device;
        }
      })
    }
    else{
      this.state.cutPoints.push({
        "cutPoint": cutPoint, 
        "device": device
      });
    }
    this.setState({
      cutPoints: this.state.cutPoints.map(e=>{return e;})
    })
    console.log(this.state.cutPoints);
  };
  deleteCutPoint = (e) =>{
    console.log(e.target.value);
    this.setState({
      cutPoints: this.state.cutPoints.filter(c =>{
        return c.cutPoint != e.target.value;
      })
    })
  }
  updateStartFrom = (e)=>{
    console.log(e);
    this.setState({
      startFrom: e
    })
  }

  deploy = (e)=>{
    console.log(this.state.cutPoints, this.state.modelName)
    var bodyFormData = new FormData();
    var outputPoints = []
    if(this.state.modelName == 'vgg16'){
      outputPoints = Const.vgg16OutputPoints;
    }else if (this.state.modelName == 'multitask'){
      outputPoints = Const.multitaskOutputPoints
    }
    bodyFormData.append('model', this.state.modelName);
    bodyFormData.append('cut_points', this.state.cutPoints.map(e => {return e.cutPoint}));
    bodyFormData.append('devices', this.state.cutPoints.map(e => {return e.device}));
    bodyFormData.append('output_points', outputPoints);
    bodyFormData.append('start_from', this.state.startFrom);
    axios.post('http://dashboard.tesla.cs.nthu.edu.tw:32510/model', bodyFormData)
    .then(e=>{
      console.log(e);
      this.setState({show: false})
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
                <div>
                <Form.Control as="select" onChange={e=>{this.setState({modelName: e.target.value})}} className='float-left' style={{width: "80%"}}>
                  <option>vgg16</option>
                  <option>multitask</option>
                </Form.Control>
                <DropdownButton className='float-right' as={ButtonGroup} variant='info' title={this.state.startFrom} className='float-right'>
                  <Dropdown.Item eventKey="cloud" onSelect={this.updateStartFrom}>cloud</Dropdown.Item>
                  <Dropdown.Item eventKey="edge" onSelect={this.updateStartFrom}>edge</Dropdown.Item>
                  <Dropdown.Item eventKey="device" onSelect={this.updateStartFrom}>device</Dropdown.Item>
                </DropdownButton>
                </div>
              </Form.Group>
              <CutPoints cutPoints={this.state.cutPoints} devices={this.state.devices} modelName={this.state.modelName} 
            deleteCutPoint={this.deleteCutPoint} updateCutPoints={this.updateCutPoints}/>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="success" onClick={this.deploy}>
              Deploy new model
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
};

export default New;