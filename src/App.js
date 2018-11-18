import React, { Component } from 'react';
import { connect } from "react-redux";
import ReactGA from 'react-ga';

import { withStyles } from '@material-ui/core/styles';

import Velocity from './views/velocity/index.js';

ReactGA.initialize('UA-1488177-23');
ReactGA.pageview(window.location.pathname + window.location.search);

const styles = theme => ({
    root: {

    },
});

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

const mapDispatch = dispatch => ({
    initIssues: dispatch.data.initIssues,
});

export default connect(null, mapDispatch)(withStyles(styles)(App));
