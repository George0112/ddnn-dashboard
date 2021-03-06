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
    if(window.confirm('Delete '+this.props.modelName + '?')){
      console.log(this.props.modelName);
      var bodyFormData = new FormData();
      bodyFormData.append('model', this.props.modelName);
      axios.delete('/model', {
        data: bodyFormData
      })
        .then(result => {
          console.log(result.data);
        })
        .catch(err=>{
          console.log(err);
        });
    }
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
            <h3>{this.props.modelName}</h3>
            <Row>
              <a>http://tesla.cs.nthu.edu.tw/{this.props.modelName}</a>
            </Row>
          </Col>
          <Col lg={6} md={6} sm={6}  className='float-left'>
            <Config modelName={this.props.modelName}/>
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