import React from 'react';
import {Row, Col} from 'react-bootstrap';
import Config from './config.jsx';
import Piece from './piece.jsx';
import axios from 'axios';

class Model extends React.Component {
    
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render(){

    var pieces = this.props.layers.map(l => {
      console.log(l)
      return <Piece layers={l}/>
    })

    return(
      <div>
        <Row className='justify-content-around'>
          <Col lg={6} md={6} sm={6}>
            {this.props.modelName}
          </Col>
          <Col lg={6} md={6} sm={6}>
            <Config modelName={this.props.modelName}/>
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