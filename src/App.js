import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from "react-redux";
import ReactGA from 'react-ga';

import Velocity from './views/velocity/index.js';

ReactGA.initialize('UA-1488177-23');
ReactGA.pageview(window.location.pathname + window.location.search);

class App extends Component {
    componentDidMount() {
        const { initIssues } = this.props;
        initIssues();
    };

    render() {
        return (
          <div className="App">
              <Velocity />
          </div>
        );
    }
}

App.propTypes = {
    initIssues: PropTypes.func.isRequired,
};

const mapDispatch = dispatch => ({
    initIssues: dispatch.data.initIssues,
});

export default connect(null, mapDispatch)(App);
