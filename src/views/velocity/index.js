import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import { connect } from "react-redux";

import Paper from '@material-ui/core/Paper';
import uuidv1 from "uuid/v1";

import VelocityChart from './Chart.js';
import LoadingIndicator from "./LoadingIndicator.js";

const styles = theme => ({
    root: {
    },
});

class Velocity extends Component {
    constructor (props) {
        super(props);
    }

    getVelocityHighcharts = (velocity) => {
        console.log(velocity);
        return velocity.map((repo) => {
            return {
                id: 'issues-' + uuidv1(), name: repo.title, data: repo.weeks.map((week) => {
                  return [new Date(week.weekStart).getTime(), Math.round(week.completion.issues.velocity, 1)];
                })
            }
        });
    };

    render() {
        const { classes, velocity, loadingCount } = this.props;
        console.log(loadingCount);
        if (loadingCount > 0) {
            return (
                <LoadingIndicator />
            );
        } else {
            return (
                <Paper className={classes.root} elevation={1}>
                    <VelocityChart series={this.getVelocityHighcharts(velocity)} />
                </Paper>
            );
        }
    }
}

Velocity.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapState = state => ({
    velocity: state.data.velocity,
    loadingCount: state.data.loadingCount,
});

export default connect(mapState, null)(withStyles(styles)(Velocity));
