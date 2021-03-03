import React from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import Config from './config.jsx';
import Piece from './piece.jsx';
import axios from 'axios';

class Model extends React.Component {
    
  constructor(props){
    super(props);
    this.state = {
    }
  }

  deleteModel = (e) => {
    console.log(this.props.modelName);
    var bodyFormData = new FormData();
    bodyFormData.append('model', this.props.modelName);
    axios.delete('http://dashboard.tesla.cs.nthu.edu.tw:32510/model', {
      data: bodyFormData
    })
      .then(result => {
        console.log(result.data);
      })
      .catch(err=>{
        console.log(err);
      });
  }

  render(){

    var pieces = this.props.layers.map(l => {
      console.log(l)
      return <Piece layers={l}/>
    })
    console.log(this.props.cuttable)

    return(
      <div>
        <Row>
          <Col lg={6} md={6} sm={6}>
            {this.props.modelName}
          </Col>
          <Col lg={6} md={6} sm={6}  className='float-left'>
            <Config modelName={this.props.modelName} cuttable={this.props.cuttable}/>
            <Button variant="danger" onClick={this.deleteModel}>Delete</Button>
          </Col>
        </Row>
        <Row>
            {pieces}
        </Row>
      </div>
    )
  }
}

export default Model;