// Helper functions to extract the data from the row
this.extractLineChartData = function (data) {
    var series_objs = {};
    for (var idx = 0; idx < that.crops.length; idx++) {

        var name = that.crops[idx];
        var id = name;
        var xs = _.filter(data, function (row) {
            return row.commodity === name &&
                row.mean !== 'NA' && row.mean !== 'na';
        })
        console.log(xs);

        var ys = _.map(xs, function (row) {
            var arr = [];
            var temp = new Date(row.date);
            arr[0] = Date.UTC(temp.getFullYear(), temp.getMonth(), temp.getDate());

            arr[1] = row.mean;
            arr[2] = row.volume;
            return arr;
        });



        var valid = _.sortBy(ys, function (arr) { arr[0]; });

        //console.log('data for ' + $scope.cropNames[idx]);
        //console.log(valid);
        var series = {};
        series.name = name;
        series.data = valid.reverse();
        series_objs[id] = series;
    }
    console.log('Full series');
    console.log(series_objs);
    return series_objs;

}



this.extractGroupedData = function (data) {

    var series = {};
    // For every crop
    for (var idx = 0; idx < that.crops.length; idx++) {
        var name = that.crops[idx];

        // Filter out their valid entries
        var xs = _.filter(data, function (row) {
            return row.commodity === name && row.mean !== 'NA' && row.mean !== 'na';
        });

        // Group the data by months
        var grouped = _.groupBy(xs, function (row) {
            var temp = new Date(row.date);
            return temp.getMonth();
        });

        grouped = _.map(grouped, function (group) { return _.map(group, 'mean') });

        var maxVals = _.map(grouped, function (group) {
            return _.max(group);
        });

        var minVals = _.map(grouped, function (group) {
            return _.min(group);
        });

        var averageVals = _.map(grouped, function (group) {
            var sum = _.reduce(group, function (a, b) { return a + b });
            return sum / group.length;
        });

        var cropData = [];
        cropData.push({ name: 'Max', data: maxVals });
        cropData.push({ name: 'Min', data: minVals });
        cropData.push({ name: 'Average', data: averageVals });
        series[name] = cropData;
    }
    return series;

};
