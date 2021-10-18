import React, { Component } from 'react';
import logo from './logo.svg';

import './App.css';

class App extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
    responseData: {},
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }
  
  callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    
    return body;
  };
  
  handleSubmit = async e => {
    e.preventDefault();
    const response = await fetch('/api/twitter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.json();
    console.log(body)
    this.setState({responseToPost: "Here's What People Think! "})
    this.setState({ responseData: body});
  }; 

render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Thoughts On This?</ h1>
          <p><strong>Find out what people think about a topic.</strong></p> 
          <p>{this.state.response}</p>
        </header>
        <body>
          <form onSubmit={this.handleSubmit}>
            <p> <strong>Post to Server:</strong></p>
            
            <p>General Search</p>
            
            <input
              type="text"
              value={this.state.post}
              onChange={e => this.setState({ post: e.target.value })}
            />
            <button type="submit">Submit</button>
          </form>
          <p>{this.state.responseToPost}</p> 
          
          <div className="tableWrapper">
            <table>
              <thead>
                <tr>
                  <th>Anger</th>
                  <th>Fear</th>
                  <th>Joy</th>
                  <th>Sadness</th>
                  <th>Analytical</th>
                  <th>Confident</th>
                  <th>Tentative</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{this.state.responseData.anger }</td>
                  <td>{this.state.responseData.fear }</td>
                  <td>{this.state.responseData.joy }</td>
                  <td>{this.state.responseData.sadness}</td>
                  <td>{this.state.responseData.analytical}</td>
                  <td>{this.state.responseData.confident}</td>
                  <td>{this.state.responseData.tentative}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p><i>Scores are rated on a scale from 0-100% based on the likelihood that a post contained this sentiment. These values are averaged across all recent posts.</i></p>
        </body>
      </div>  
        
    );
  }
}

export default App;
