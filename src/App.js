import React, { Component } from 'react';
import { connect } from "react-redux";

import { withStyles } from '@material-ui/core/styles';

import Velocity from './views/velocity/index.js';

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
