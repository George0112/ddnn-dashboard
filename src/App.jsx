import logo from './logo.svg';
import './App.css';
import { Container, Row, Col, 
  Navbar, Nav, NavDropdown, Form, FormControl,
  Button, ButtonGroup} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { render } from '@testing-library/react';
import Model from './components/model.jsx';
import axios from 'axios';

class App extends React.Component {

  constructor(props){
    super(props);
    this.state={
      layers: [[0]],
      modelName: [''],
      cuttable: []
    }
  };

  componentDidMount() {
    axios.get('http://tesla.cs.nthu.edu.tw:32510/info')
      .then(result => {
        console.log(result.data);
        this.setState({layers: result.data})
      })
      .catch(err=>{
        console.log(err);
      });
    
    axios.get('http://tesla.cs.nthu.edu.tw:32510/name')
      .then(result=>{
        console.log(result.data);
        this.setState({modelName: [result.data]});
      })
      .catch(err =>{
        console.log(err);
      });

    axios.get('http://tesla.cs.nthu.edu.tw:32510/cuttable')
    .then(result=>{
      console.log(result.data);
      this.setState({cuttable: result.data});
    })
    .catch(err =>{
      console.log(err);
    });
  }

  renderModel(modelName){
    return <Model modelName={modelName} layers={this.state.layers} cuttable={this.state.cuttable}/>
  }

  render(){

    var models = this.state.modelName.map(model=>{
      return this.renderModel(model);
    })

    return (
      <div>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#link">Link</Nav.Link>
              <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Form inline>
              <FormControl type="text" placeholder="Search" className="mr-sm-2" />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>
        <Container>
          {models}
        </Container>
      </div>
    );
  }
}

export default App;
