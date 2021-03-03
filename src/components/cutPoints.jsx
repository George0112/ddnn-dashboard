import React from 'react';
import {Row, Col, ButtonGroup, Button, Modal, Dropdown, Card, ListGroup, DropdownButton} from 'react-bootstrap';

class CutPoints extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render(){

    if(this.props.modelName.split('-')[0]=='vgg16'){
      var cuttable = [
        {
          "index": 0, 
          "name": "input_1"
        }, 
        {
          "index": 1, 
          "name": "block1_conv1"
        }, 
        {
          "index": 2, 
          "name": "block1_conv2"
        }, 
        {
          "index": 3, 
          "name": "block1_pool"
        }, 
        {
          "index": 4, 
          "name": "block2_conv1"
        }, 
        {
          "index": 5, 
          "name": "block2_conv2"
        }, 
        {
          "index": 6, 
          "name": "block2_pool"
        }, 
        {
          "index": 7, 
          "name": "block3_conv1"
        }, 
        {
          "index": 8, 
          "name": "block3_conv2"
        }, 
        {
          "index": 9, 
          "name": "block3_conv3"
        }, 
        {
          "index": 10, 
          "name": "block3_pool"
        }, 
        {
          "index": 11, 
          "name": "block4_conv1"
        }, 
        {
          "index": 12, 
          "name": "block4_conv2"
        }, 
        {
          "index": 13, 
          "name": "block4_conv3"
        }, 
        {
          "index": 14, 
          "name": "block4_pool"
        }, 
        {
          "index": 15, 
          "name": "block5_conv1"
        }, 
        {
          "index": 16, 
          "name": "block5_conv2"
        }, 
        {
          "index": 17, 
          "name": "block5_conv3"
        }, 
        {
          "index": 18, 
          "name": "block5_pool"
        }, 
        {
          "index": 19, 
          "name": "flatten"
        }, 
        {
          "index": 20, 
          "name": "fc1"
        }, 
        {
          "index": 21, 
          "name": "fc2"
        }
      ]
    }
    else var cuttable = []

    var cutPoints = this.props.cutPoints;
    var options = cutPoints.map(cutPoint => {
      if(cuttable.length >0)
        return (
          <ListGroup.Item>
            Layer {cutPoint}: {cuttable[cutPoint].name}
            <Button className='float-right' value={cutPoint} onClick={this.props.deleteCutPoint}>Delete</Button>
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
        <Dropdown.Item eventKey={cut.index} onSelect={this.props.updateCutPoints}>{cut.index}: {cut.name}</Dropdown.Item>
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
}

export default CutPoints;