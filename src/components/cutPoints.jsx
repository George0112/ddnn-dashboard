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
            Layer {cutPoint.cutPoint}: {cuttable[cutPoint.cutPoint].name}
            <Button className='float-right' variant='danger' value={cutPoint.cutPoint} onClick={this.props.deleteCutPoint}>Delete</Button>
            <DropdownButton className='float-right'as={ButtonGroup} variant='info' title={cutPoint.device}>
              <Dropdown.Item eventKey={cutPoint.cutPoint+"-cloud"} onSelect={this.props.updateCutPoints}>cloud</Dropdown.Item>
              <Dropdown.Item eventKey={cutPoint.cutPoint+"-edge"} onSelect={this.props.updateCutPoints}>edge</Dropdown.Item>
              <Dropdown.Item eventKey={cutPoint.cutPoint+"-device"} onSelect={this.props.updateCutPoints}>device</Dropdown.Item>
            </DropdownButton>
          </ListGroup.Item>
        )
      else
        return;
    });

    var cuttable = cuttable.map(cut =>{
      if(cutPoints.length > 0)
        if(cut.index <= cutPoints[cutPoints.length-1].cutPoint || cutPoints[0].cutPoint == 0){
        return;
      }
      return (
        <Dropdown.Item eventKey={cut.index+"-cloud"} onSelect={this.props.updateCutPoints}>{cut.index}: {cut.name}</Dropdown.Item>
      );
    })

    return (
      <Card style={{ width: '100%' }}>
        <ListGroup variant="flush">
          {options}
        </ListGroup>
        <Card.Body>
          <ButtonGroup className='justify-content-between'>
            <DropdownButton as={ButtonGroup} title="Cuttable Points" id="cut-points-dropdown">
              {cuttable}
            </DropdownButton>
          </ButtonGroup>
        </Card.Body>
      </Card>
    )
  }
}

export default CutPoints;