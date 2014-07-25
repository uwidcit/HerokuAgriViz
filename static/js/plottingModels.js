

// Function that returns a plotting model for a line chart
var line_chart = function (chartContainer, allSeries) {
    
    return {

        // The data to be used to plot the charts
        series: allSeries,

        // The options to use to guide chart construction
        options: {

            title: {
                text: 'Comparison of Mean Crop Prices Across Several Months',
                x: -20
            },

            yAxis: {

                title: {
                    text: 'Mean Price (TTD)'
                },
                min: 0

            },

            tooltip: {

                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>${point.y}</b><br/>',
                valueDecimals: 2
            },

            legend: {
                enabled: true,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },

            series: [],

            chart: {
                type: 'spline',
                zoomType: 'x',
                renderTo: chartContainer
            },

            exporting: {
                enabled: true,
            },

            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: { // don't display the dummy year
                    month: '%b \'%y',
                    year: '%Y'
                },
                title: {
                    text: 'Month'
                }

            }
        },

        // Hold current state of the line chart
        currentlyPlottedCrops: {},
        currentChart: null,

        // Tell if a crop is actively being plotted or not
        cropActive: function(cropID) {
            return this.currentlyPlottedCrops[cropID] === true;
        },

        // Removes a crop from being actively plotted
        removeCrop: function(cropID) {
            var name = this.series[cropID].name;
            for(var idx = 0; idx < this.currentChart.series.length; idx++) {
                if(this.currentChart.series[idx].name === name){
                    this.currentChart.series[idx].remove(true);
                    break;
                }
            }
        },

        // Handles the click event on a crop selector
        handleClick: function (cropID) {
            console.log('Checking for ' + cropID);
            if (this.currentChart === undefined || this.currentChart === null) {
                
                this.currentChart = new Highcharts.StockChart(this.options);
                this.currentChart.addSeries(this.series[cropID]);
                this.currentlyPlottedCrops[cropID] = true;
            } else if (this.cropActive(cropID) != true) {
                
                this.currentChart.addSeries(this.series[cropID]);
                this.currentlyPlottedCrops[cropID] = true;
            } else {
                
                this.currentlyPlottedCrops[cropID] = false;
                this.removeCrop(cropID);
            }

        },

    }


}