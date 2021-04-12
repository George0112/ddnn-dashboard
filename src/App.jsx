import logo from './logo.svg';
import './App.css';
import { Container, Row, Col, 
  Navbar, Nav, NavDropdown, Form, FormControl,
  Button, ButtonGroup, ListGroup} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { render } from '@testing-library/react';
import Model from './components/model';
import axios from 'axios';
import New from './components/new';

class App extends React.Component {

  constructor(props){
    super(props);
    this.state={
      models: [],
      currentModel: null
    }
  };

  componentDidMount() {
    axios.get('/info')
      .then(result => {
        console.log(result.data);
        this.setState({models: result.data})
        if(this.state.models.length > 0){
          this.setState({currentModel: this.state.models[0]})
        }
      })
      .catch(err=>{
        console.log(err);
      });
  };

  clickSide = (e) => {
    console.log(e)
    var m = this.state.models.find((m) => {return m.name == e.target.value})
    console.log(m)
    this.setState({currentModel: m})
  };

  renderModel(model){
    console.log(model)
    if(model.status != "pending")
    return <Model modelName={model.name} layers={model.info} cuttable={model.cuttable} endPoint={model.endPoint}/>
    else
    return <h3>Pending</h3>
  };

  renderSide(model, currentModel){
    console.log(model)
    return <ListGroup.Item action active={currentModel && currentModel.name==model.name} 
      value={model.name} onClick={this.clickSide}>
        {model.name}
      </ListGroup.Item>
  };

  render(){

    var sides = this.state.models.map(model=>{
      return this.renderSide(model, this.state.currentModel);
    })

    var models = this.state.currentModel ? this.renderModel(this.state.currentModel) : ""

    return (
      <div>
        <Navbar bg="light" expand="lg">
          <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="#home">Home</Nav.Link>
            </Nav>
            <Form inline>
              <FormControl type="text" placeholder="Search" className="mr-sm-2" />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>
        <Container style={{marginTop: '30px'}}>
          <Row>
            <Col xl={3} lg={3}>
              <ListGroup>
                <New/>
                {sides}
              </ListGroup>
            </Col>
            <Col xl={9} lg={9}>
              {models}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
