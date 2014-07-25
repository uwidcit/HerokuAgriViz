

var app = angular.module('chartingApp', []);
var currentPlottingModel = {};
var currentType = "";
var allMonthlyData = null;

// The controller to be used to get and prepare the data to be plotted
app.controller('DataLoadingController', ['$scope', '$http', function ($scope, $http) {
    console.log('Loading data');

    // Initialize the various containers
    $scope.crops = [];
    $scope.monthlyData = {};
    $scope.lineGraphData = {};
    $scope.groupedGraphData = {};


    $scope.chartContainerSet = $('#chartContainer');
    $scope.chartContainer = $scope.chartContainerSet[0];




    // API URI's to access the data
    $scope.dataLoc = "http://127.0.0.1:5000/crops/monthly/all";
    $scope.cropNameLoc = "http://127.0.0.1:5000/crops/monthly/commodity/"

    // Helper functions to extract the data from the row
    $scope.extractLineChartData = function (data) {
        var series_objs = {};
        for (var idx = 0; idx < $scope.crops.length; idx++) {

            var name = $scope.crops[idx];
            var id = name;
            var xs = _.filter(data, function (row) {
                return row.commodity === name &&
                    row.mean !== 'NA' && row.mean !== 'na';
            })
            //console.log(xs);

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



    $scope.extractGroupedData = function (data) {

        var series = {};
        // For every crop
        for (var idx = 0; idx < $scope.crops.length; idx++) {
            var name = $scope.crops[idx];

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

    // Firslty, we need to grab all of the needed data
    $http.get($scope.cropNameLoc).success(function (d1) {

        $scope.crops = d1;

        $http.get($scope.dataLoc).success(function (d2) {

            $scope.monthlyData = d2;
            $scope.lineGraphData = $scope.extractLineChartData(d2);
            //$scope.lineGraph = line_chart($scope.chartContainer, $scope.lineGraphData);
            //console.log($scope.lineGraph);
            $scope.groupedChartData = $scope.extractGroupedData(d2);
            console.log($scope.groupedChartData);
        })


    });


}]);

// The controller to be used to select chart types 
app.controller('ChartModelController', ['$scope', function ($scope) {

    $scope.currentChart = {};

    $scope.selectChartingModel = function (modelName) {

        $scope.currentChartType = '';
        if (modelName === 'line') {
            $scope.currentChart = line_chart($scope.lineGraphData,
                $scope.chartContainer);
            console.log('Selected line chart');
            console.log($scope.currentChart);

        } else if (modelName === 'bar') {
            $scope.currentType = 'bar'
            console.log('Selected bar chart');


        } else if (modelName === 'box') {
            $scope.currentType = 'box';
            console.log('Selected Box plot');
        } else {
            $scope.currentType = 'bubble';
            console.log('Bubble chart selected');
        }

        //$scope.currentChartType = modelName;
        //currentType = modelName;
        console.log($scope.currentType);

    };



}]);

/*
    // This controller facilitates the selection of crops for the different controllers
    app.controller('ChartingContoller', ['$scope', '$http' , function($scope, $http) {
        
        
        
        $scope.chartContainerSet = $('#chartContainer');
        $scope.chartContainer = $scope.chartContainerSet[0];
        $scope.lineCharter = {};
       
        // Functions to extract the data to provide the line charts

        $scope.extractLineChartData = function (data) {
            var series_objs = {};
            for (var idx = 0; idx < $scope.cropNames.length; idx++) {
                
                var name = $scope.cropNames[idx];
                var id = name;
                var xs = _.filter(data, function (row) {
                    return row.commodity === name &&
                        row.mean !== 'NA' && row.mean !== 'na';
                })
                //console.log(xs);

                var ys = _.map(xs, function (row) {
                    var arr = [];
                    var temp = new Date(row.date);
                    arr[0] = Date.UTC(temp.getFullYear(), temp.getMonth(), temp.getDate());

                    arr[1] = row.mean;
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
        $scope.lineChartData = {};
        $scope.cropIDs = [];
        $scope.annotations = {};
        $scope.allCrops = [];
        $scope.charter = this;
        $scope.dataLoc = "http://127.0.0.1:5000/crops/monthly/all";
        $scope.cropNames = [];
        $scope.cropNameLoc = "http://127.0.0.1:5000/crops/monthly/commodity/"
        

        $http.get($scope.cropNameLoc).success(function (data) {
            $scope.cropNames = data;
            $http.get($scope.dataLoc).success(function (data) {
                console.log('looking for data');
                allMonthlyData = data;
                $scope.allCrops = data;

                //console.log('extracting line graph data');
                $scope.lineChartData = $scope.extractLineChartData(data);
                //console.log('showing line graph data');
                //console.log($scope.lineChartData);
                $scope.lineCharter = line_chart($scope.chartContainer, $scope.lineChartData);
                console.log('chart data: ');
                console.log($scope.lineCharter);
                
            });
        });

        $scope.handleClick = function (id) {
            $scope.lineCharter.handleClick(id);

        };

        $scope.isCropActive = function (id) {
            if ($scope.lineCharter !== null || $scrope.lineCharter !== undefined) {
                return $scope.lineCharter.cropActive(id);
            }
            return false;
        }

        /*
        $scope.getAnnotations = function () {
            if ($scope.annotations[currentType] === undefined) {
                $http.get("http://127.0.0.1:5000/annotations/" + currentType).success(function (data){
                    $scope.annotations[currentType] = data;
                    return $scope.annotations;
                });
            }
            else {
                return $scope.annotations;
            }
        } */

/*  }]); */




