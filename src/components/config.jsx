import React from 'react';
import {Row, Col, ButtonGroup, Button, Modal, Dropdown, Card, ListGroup, DropdownButton} from 'react-bootstrap';
import CutPoints from './cutPoints';
import axios from 'axios';

class Config extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      show: false,
      cutPoints: [],
      outputPoints: [-1]
    }
  };

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
    axios.put('http://dashboard.tesla.cs.nthu.edu.tw:32510/model', bodyFormData)
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
    this.state.cutPoints.push((e))
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

  renderCutPoints(cutPoints, cuttable){
    console.log(cutPoints, cuttable);
    var options = cutPoints.map(cutPoint => {
      if(cuttable.length >0)
        return (
          <ListGroup.Item>
            Layer {cutPoint}: {cuttable[cutPoint].name}
            <Button className='float-right' value={cutPoint} onClick={this.deleteCutPoint}>Delete</Button>
          </ListGroup.Item>
        )
      else
        return;
    });

    var cuttable = cuttable.map(cut =>{
      if(cutPoints.length > 0 && cut.index <= cutPoints[cutPoints.length-1]){
        return;
      }
      return (
        <Dropdown.Item eventKey={cut.index} onSelect={this.updateCutPoints}>{cut.index}: {cut.name}</Dropdown.Item>
      );
    })

    return (
      <Card style={{ width: '100%' }}>
        <ListGroup variant="flush">
          {options}
        </ListGroup>
        <Card.Body>
          <ButtonGroup className='justify-content-between'>
            <DropdownButton as={ButtonGroup} title="Cuttable Points" id="bg-nested-dropdown">
              {cuttable}
            </DropdownButton>
          </ButtonGroup>
        </Card.Body>
      </Card>
    )
  }

  render(){

    // var cutPoints = this.renderCutPoints(this.state.cutPoints, this.props.cuttable);

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