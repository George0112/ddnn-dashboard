import React from 'react';
import {Container, Row, Col, Table} from 'react-bootstrap';

class Piece extends React.Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  renderRow(layer){
    console.log(layer);
    return(
      <tr key={layer.name}>
        <td>{layer.name}</td>
        {/* <td>{layer.input}</td>
        <td>{layer.input_shape}</td>
        <td>{layer.output_shape}</td> */}
      </tr>
    )
  }

  render(){
    var layers = this.props.layers;
    console.log(layers);
    var rows = this.props.layers.map(l=>{
      console.log(l);
      return this.renderRow(l)
    })
    return(
      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Layer Name</th>
              {/* <th>Layer Input</th>
              <th>Input Shape</th>
              <th>Output Shape</th> */}
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    )
  }
}

export default Piece;