import React from 'react';
import {Row, Col, ButtonGroup, Button, Modal, Dropdown, Card, ListGroup, DropdownButton} from 'react-bootstrap';
import CutPoints from './cutPoints';
import axios from 'axios';
import Const from './const';

class Config extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show: false,
      cutPoints: [],
      outputPoints: [-1]
    }
  };

  componentDidMount(){
    if(this.props.modelName.split('-')[0] == 'vgg16'){
      this.setState({outputPoints: Const.vgg16OutputPoints})
    }else if(this.props.modelName.split('-')[0] == 'multitask'){
      this.setState({outputPoints: Const.multitaskOutputPoints})
    }
  }

  handleShow = () => {
    this.setState({show: true});
  };

  handleClose = () => {
    this.setState({show: false});
  };

  handleSubmit = ()=>{
    var bodyFormData = new FormData();
    bodyFormData.append('model', this.props.modelName);
    bodyFormData.append('cut_points', this.state.cutPoints);
    bodyFormData.append('output_points', this.state.outputPoints);
    axios.put('/model', bodyFormData)
    .then(e=>{
      console.log(e);
    })
    .catch(e=>{
      console.log(e);
    })

    this.setState({show: false});
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

  render(){

    return(
      <>
        <Button className='float-left' variant="primary" onClick={this.handleShow}>
          Config
        </Button>

        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.modelName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CutPoints cutPoints={this.state.cutPoints} modelName={this.props.modelName} 
            deleteCutPoint={this.deleteCutPoint} updateCutPoints={this.updateCutPoints}/>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleSubmit}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  }
}

export default Config;
