import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official'

class VelocityChart extends Component {
    constructor(props) {
        super(props);
    }

    getChartOptions = (series) => {
        return {
            chart: {
                type: 'area',
                height: 600
            },
            rangeSelector: {
                selected: 5
            },
            title: {
                text: 'Closed issues, weekly velocity (4 weeks rolling average)'
            },
            yAxis: {
                title: {
                    text: 'Issues'
                }
            },
            tooltip: {
                split: true,
                valueSuffix: ' issues'
            },
            legend: {
              enabled: true
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#666666'
                    }
                }
            },
            series: series
        };
    };

    render() {
      const { series } = this.props;
        return (
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'stockChart'}
                options={this.getChartOptions(series)}
            />

        );
    }
}

VelocityChart.propTypes = {
    series: PropTypes.array.isRequired,
};

export default VelocityChart;
