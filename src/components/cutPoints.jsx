import React from 'react';
import {Row, Col, ButtonGroup, Button, Modal, Dropdown, Card, ListGroup, DropdownButton} from 'react-bootstrap';
import Const from './const';

class CutPoints extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render(){

    if(this.props.modelName.split('-')[0]=='vgg16'){
      var cuttable = Const.vgg16CuttablePoints
    }
    else if(this.props.modelName.split('-')[0]=='multitask'){
      var cuttable = Const.multitaskCuttablePoints
    }

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