import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { connect } from "react-redux";

import Snackbar from "@material-ui/core/Snackbar";
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = theme => ({
    root: {
    },
});

class LoadingIndicator extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        const { loadingMessage } = this.props;
        return (
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={true}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={
                    <div>
                        <span>{loadingMessage}</span>
                        <LinearProgress color="primary" variant="indeterminate" />
                    </div>
                }
            />
        );
    }
}

LoadingIndicator.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapState = state => ({
  loadingMessage: state.data.loadingMessage,
});

export default connect(mapState, null)(withStyles(styles)(LoadingIndicator));
