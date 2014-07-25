

var app = angular.module('chartingApp', ['ngSanitize', 'checklist-model']);
    var currentPlottingModel = {};
    var currentType = "";
    var allMonthlyData = null;

    

    // Handles the preparation and ussage of the line graph
    app.service('LineChartingService', ['DataLoadingService', function(DataLoadingService) {
        var that = this;
        this.rawData = {};
        this.data = {};
        this.names = [];
        DataLoadingService.addCropObserver(function (d) {
            that.names = d;
        });
        DataLoadingService.addRawDataObserver(function (d) {
            that.rawData = d;
            that.extractData();
        });
        // Extracts and prepares the data relevant to the line charts
        this.createChart = function () {
            var options = {
                title: {
                    text: 'Comparsion of Mean Crop Prices Across Several Months',
                    x: -20
                },

                yAxis: {
                    title: { text: "Mean Price (TTD)" },
                    min: 0
                },



                tooltip: {
                    //valueDecimals: 2,
                    //valuePrefix: '$',
                    //valueSuffix: ' TTD',
                    //headerFormat: '<b>{series.name}</b><br>',
                    //headerFormat: '<b>{series.name}</b><br>',
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
                    renderTo: DataLoadingService.chartContainer,
                    type: 'spline',
                    zoomType: 'x'
                },

                exporting: {
                    enabled: true
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
            };

            that.currentPlot = new Highcharts.StockChart(options);
            console.log(that.currentPlot);
            return that.currentPlot;

        } // To implement
        this.removeSeries = function (crop) {
            for (var idx = 0; idx < that.currentPlot.series.length; idx++) {
                if (that.currentPlot.series[idx].name === crop) {
                    that.currentPlot.series[idx].remove(true);
                    break;
                }
            }

        } // To implement
        this.currentPlot = null;
        this.extractData = function () {
            
            that.names.forEach(function (crop) {
                var series = {};
                var relevantRows = _.filter(that.rawData, function (row) {
                    return row.commodity === crop && row.mean != 'NA' && row.mean != 'na';
                });

                console.log('All Data for ' + crop);
                console.log({ items: relevantRows });

                var withRelevantData = _.map(relevantRows, function (row) {
                    var arr = [];
                    var temp = new Date(row.date);
                    arr[0] = Date.UTC(temp.getFullYear(), temp.getMonth());
                    arr[1] = row.mean;
                    return arr;
                });

                var sortedData = _.sortBy(withRelevantData, function (arr) {
                    return arr[0];
                });

                

                series.name = crop;
                series.data = sortedData;
                that.data[crop] = series;

            });
            console.log('Logged the following data for usage in line plots')
            console.log(that.data);

        }
        this.plotted = {};
        this.beingPlotted = function (cropID) {
            if (that.plotted[cropID] === true) {
                return true;
            } else {
                return false;
            }
            
        }
        this.handleClick = function (cropID) {
            console.log(that.data[cropID]);
            if (that.currentPlot === null) {
                that.currentPlot = that.createChart();
                that.currentPlot.addSeries(that.data[cropID]);
                console.log('constructing plot....')
                that.plotted[cropID] = true;
                console.log(that.plotted);
                console.log(that.beingPlotted(cropID));
            } else if(that.beingPlotted(cropID) != true) {
                that.currentPlot.addSeries(that.data[cropID]);
                that.plotted[cropID] = true;
            } else {
                that.removeSeries(cropID);
                that.plotted[cropID] = false;
            }

            
        }

        this.getActiveCrops = function () {
            var activeCrops = [];
            for (var crop in that.plotted) {
                if (that.beingPlotted(crop) == true) {
                    activeCrops.push(crop);
                }
            }
            return activeCrops;
        }
        this.getSeriesColors = function () {
            var colors = {};
            for (var idx = 0; idx < that.currentPlot.series.length; idx++) {
                var name = that.currentPlot.series[idx].name;
                var color = that.currentPlot.series[idx].color;
                colors[name] = color;
            }
            return colors;
        }

    }]);
    app.service('BubbleChartingService', ['DataLoadingService', function (DataLoadingService) {
        var that = this;
        this.units = {};
        this.rawData = {};
        this.data = {};
        this.names = [];
        DataLoadingService.addCropObserver(function (d) {
            that.names = d;
        });
        DataLoadingService.addRawDataObserver(function (d) {
            that.rawData = d;
            that.extractData();
        });
        // Extracts and prepares the data relevant to the line charts
        this.createChart = function () {
            var options = {

                title: {
                    text: 'Bubble Chart Showing the Relationship between Mean Price and Volume'
                },

                chart: {
                    type: 'bubble',
                    renderTo: DataLoadingService.chartContainer,
                    zoomType: 'xy'
                },

                series: [],

                xAxis: {

                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%b \'%y',
                        year: '%Y'
                    },

                    title: {
                        text: 'Month'
                    }

                },

                yAxis: {
                    min: 0,
                    title: {
                        text: 'Prices (TTD)'
                    }

                },



                tooltip: {
                    formatter: function () {
                        var months = ["January", "February", "March",
                        "April", "May", "June", "July", "August", "September",
                        "October", "November", "December"];
                        var d = new Date(this.x);
                        var m = months[d.getMonth()];
                        var year = d.getFullYear();
                        var date = m + " " + year;
                        return "<b>" + date + "</b><br/>" +
                            this.series.name + ": $" + this.y.toFixed(2) + "<br/>" +
                            "Units Produced: " + this.point.z + " " + that.units[this.series.name];
                    }
                }
            };

            that.currentPlot = new Highcharts.Chart(options);
            console.log(that.currentPlot);
            return that.currentPlot;

        } // To implement
        this.removeSeries = function (crop) {
            for (var idx = 0; idx < that.currentPlot.series.length; idx++) {
                if (that.currentPlot.series[idx].name === crop) {
                    that.currentPlot.series[idx].remove(true);
                    break;
                }
            }

        } // To implement
        this.currentPlot = null;
        this.extractData = function () {

            that.names.forEach(function (crop) {
                var series = {};
                var relevantRows = _.filter(that.rawData, function (row) {
                    return row.commodity === crop && row.mean != 'NA' && row.mean != 'na' &&
                        row.volume != 'NA' && row.volume != 'na';
                });

                console.log('All Data for ' + crop);
                console.log({ items: relevantRows });

                that.units[crop] = relevantRows[0].unit

                var withRelevantData = _.map(relevantRows, function (row) {
                    var arr = [];
                    var temp = new Date(row.date);
                    arr[0] = Date.UTC(temp.getFullYear(), temp.getMonth());
                    arr[1] = row.mean;
                    arr[2] = row.volume;
                    return arr;
                });

                var sortedData = _.sortBy(withRelevantData, function (arr) {
                    return arr[0];
                });

                series.name = crop;
                series.data = sortedData;
                that.data[crop] = series;

            });
            console.log('Logged the following data for usage in line plots')
            console.log(that.data);

        }
        this.plotted = {};
        this.beingPlotted = function (cropID) {
            if (that.plotted[cropID] === true) {
                return true;
            } else {
                return false;
            }

        }
        
        this.handleClick = function (cropID) {
            if (that.currentPlot === null) {
                that.currentPlot = that.createChart();
                that.currentPlot.addSeries(that.data[cropID]);
                console.log('constructing plot....')
                that.plotted[cropID] = true;
                console.log(that.plotted);
                console.log(that.beingPlotted(cropID));
            } else if(that.beingPlotted(cropID) != true) {
                that.currentPlot.addSeries(that.data[cropID]);
                that.plotted[cropID] = true;
            } else {
                that.removeSeries(cropID);
                that.plotted[cropID] = false;
            }

            
        }

        this.getActiveCrops = function () {
            var activeCrops = [];
            for (var crop in that.plotted) {
                if (that.beingPlotted(crop) == true) {
                    activeCrops.push(crop);
                }
            }
            return activeCrops;
        }

        this.getSeriesColors = function () {
            var colors = {};
            for (var idx = 0; idx < that.currentPlot.series.length; idx++) {
                var name = that.currentPlot.series[idx].name;
                var color = that.currentPlot.series[idx].color;
                colors[name] = color;
            }
            return colors;
        }
        

    }]);
    

    app.service('BarChartingService', ['DataLoadingService', function (DataLoadingService) {
        var that = this;
        
        this.rawData = {};
        this.data = {};
        this.names = [];
        DataLoadingService.addCropObserver(function (d) {
            that.names = d;
        });
        DataLoadingService.addRawDataObserver(function (d) {
            that.rawData = d;
            that.extractData();
        });
        // Extracts and prepares the data relevant to the line charts
        this.createChart = function (series_data) {
            console.log(series_data);
            var options = {

                plotOptions: {
                    column: {
                        stacking: 'normal'
                    }
                },

                title: {
                    text: 'Price Extremes By Month'
                },

                chart: {
                    type: 'column',
                    renderTo: DataLoadingService.chartContainer
                },

                series: series_data,

                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept',
                        'Oct', 'Nov', 'Dec']
                },

                yAxis: {
                    min: 0,
                    title: {
                        text: 'Prices (TTD)'
                    }

                },



                tooltip: {
                    formatter: function () {
                        return "<b>" + this.x + "</b><br/>" +
                            this.series.name + ": $" + this.y.toFixed(2) + "<br/>";
                    }
                }
            };

            that.currentPlot = new Highcharts.Chart(options);
            console.log(that.currentPlot);
            return that.currentPlot;

        } // To implement
        this.removeSeries = function (crop) {
            for (var idx = 0; idx < that.currentPlot.series.length; idx++) {
                if (that.currentPlot.series[idx].name === crop) {
                    that.currentPlot.series[idx].remove(true);
                    break;
                }
            }

        } // To implement
        this.currentPlot = null;
        this.extractData = function () {

            that.names.forEach(function (crop) {
                var series = {};
                var relevantRows = _.filter(that.rawData, function (row) {
                    return row.commodity === crop && row.mean != 'NA' && row.mean != 'na';
                });

                console.log('All Data for ' + crop);
                console.log({ items: relevantRows });

               

                var withRelevantData = _.map(relevantRows, function (row) {
                    var coll = {};
                    coll.date = new Date(row.date);
                    coll.mean = row.mean;
                    return coll;
                });

                var groupedByMonth = _.groupBy(withRelevantData, function (row) {
                    return row.date.getMonth();
                });

                var maxVals = _.map(groupedByMonth, function (group) {
                    return _.max(group, 'mean');
                });

                maxVals = _.map(maxVals, 'mean');

                var minVals = _.map(groupedByMonth, function (group) {
                    return _.min(group, 'mean');
                });

                minVals = _.map(minVals, 'mean');

                var averageVals = _.map(groupedByMonth, function (group) {
                    var means = _.map(group, 'mean');
                    //console.log('Mean Vals:');
                    //console.log(means);
                    var sum = _.reduce(means, function (acc, entry) {
                        
                        return acc + entry;
                    }, 0);
                    //console.log(sum)
                    return sum / means.length;
                });

                

                var arr = [];
                arr[0] = {};
                arr[0].name = "Max";
                arr[0].data = maxVals;
                arr[0].stack = 'max';

                arr[1] = {};
                arr[1].name = "Min";
                arr[1].data = minVals;
                arr[1].stack = 'min';

                arr[2] = {};
                arr[2].name = "Average";
                arr[2].data = averageVals;
                
                arr[2].stack = 'average';
                that.data[crop] = arr;

            });
            console.log('Logged the following data for usage in bar plots')
            console.log(that.data);

        }
        this.plotted = {};
        this.beingPlotted = function (cropID) {
            if (that.plotted[cropID] === true) {
                return true;
            } else {
                return false;
            }

        }

        this.getActiveCrops = function () {
            for (var crop in that.plotted) {
                if (that.plotted.hasOwnProperty(crop) === true) {
                    if (that.plotted[crop] === true) {
                        return [crop];
                    }
                }
            }
            return [];
        }

        this.getSeriesColors = function () {
            return [];
        }

        this.handleClick = function (cropID) {

            if (that.beingPlotted(cropID) !== true) {
                var series = that.data[cropID];
                that.currentPlot = that.createChart(series);
                that.plotted[cropID] = true;
            } else {
                console.log('Trying to remove ' + cropID);
                that.plotted[cropID] = false;
                that.removeSeries(cropID);
            }

            


        }

    }]);

    app.service('ChartingService', ['LineChartingService', 'BubbleChartingService', 'BarChartingService',
        function (LineChartingService, BubbleChartingService, BarChartingService) {
        var that = this;
        this.currentType = 'line';
        this.plotted = {};
        this.currentService = LineChartingService;
        this.handleClick = function (cropID) {
            that.currentService.handleClick(cropID);
        };
        this.beingPlotted = function (cropID) {
            return that.currentService.beingPlotted(cropID);
        };
        this.switchServices = function (chartType) {
            if (chartType != that.currentType) {
                $('#chartContainer').empty();
                that.currentService.currentPlot = null;
                that.currentService.plotted = {};
            }

            if (chartType === 'line') {
                that.currentService = LineChartingService;
                that.currentType = 'line';
            } else if (chartType === 'bar') {
                that.currentService = BarChartingService;
                that.currentType = 'bar';
            } else if (chartType === 'bubble') {
                that.currentService = BubbleChartingService;
                that.currentType = 'bubble';
            }
        }
        this.serviceActive = function (chartType) {
            return chartType === that.currentType;
        }
        this.getActiveCrops = function () {
            return that.currentService.getActiveCrops();
        }
        this.getSeriesColors = function () {
            return that.currentService.getSeriesColors();
        }
    }]);
    
// The controller to be used to get the data to be plotted
// We use the observer to notify the services and controllers that depend on the data
// after the asynchronous request -- uses the observer pattern
    app.service('DataLoadingService', ['$http', function ($http) {
        console.log('Loading data');



        /* METHODS TO OBSERVE THE CROP VARIABLES */
        
        
        this.crops = [];
        this.cropObservers = [];
        

        this.addCropObserver = function (obs) {
            that.cropObservers.push(obs);
        }

        this.notifyCropObservers = function () {
            for (var idx = 0; idx < that.cropObservers.length; idx++) {
                var fn = that.cropObservers[idx];
                fn(that.crops)
            }
        }

        /* METHODS TO OBSERVE THE DATA TO PLOT THE CROPS */
        this.rawData = null;
        this.rawDataObservers = [];
        this.addRawDataObserver = function (obj) {
            that.rawDataObservers.push(obj);
        }
        this.notifyRawDataObservers = function (d1) {
            that.rawDataObservers.forEach(function (fn) {
                fn(d1);
            });
        }
        var that = this;
        
        

        this.chartContainerSet = $('#chartContainer');
        this.chartContainer = this.chartContainerSet[0];




        // API URI's to access the data
        this.dataLoc = "http://127.0.0.1:5000/crops/monthly/all";
        this.cropNameLoc = "http://127.0.0.1:5000/crops/monthly/commodity/"
        
   
        // Firslty, we need to grab all of the needed data
        $http.get(this.cropNameLoc).success(function (d1) {
            console.log('Logging crops....');
            that.crops = d1;
            console.log(that.crops);
            that.notifyCropObservers();
            $http.get(that.dataLoc).success(function (d2) {
                that.rawData = d2;
                console.log(that.rawData);
                that.notifyRawDataObservers(d2);
                console.log('Notified all observers');
                $('#chartContainer').empty();
            });


        });

        this.getAnnotations = function (chartType, fn) {
            var annotationAPI = "http://127.0.0.1/" + chartType;
            $http.get(annotationAPI + chartType).success(function (data) {
                fn(data);
            });
        }

        
        

    }]);

    
    app.service('AnnotationPersistenceService', ['$http', 'DataLoadingService', 'ChartingService',
        function ($http, DataLoadingService, ChartingService) {

            var that = this;
            this.annotationGetURI = "http://127.0.0.1:5000/annotations/";
                
            this.annotationObservers = [];
            this.registerAnnotationObserver = function (fn) {
                that.annotationObservers.push(fn);
            }
            this.notifyObservers = function (data, plottedCrops) {
                that.annotationObservers.forEach(function (fn) {
                    fn(data, plottedCrops);
                });
            }
            this.reloadAnnotations = function (chartModel, cropArr) {
                var allPlottedCrops = cropArr;
                $http.get(that.annotationGetURI + chartModel).success(function (data) {
                    console.log(data);
                    var ans = _.filter(data, function (entry) {
                        return _.some(cropArr, function (crop) {
                            return crop === entry.commodity;
                        });
                    });

                    ans.forEach(function (annotation) {
                        if(annotation.image != undefined && annotation.image != '' 
                            && annotation.image != null) {
                            annotation.showImage = true;
                            console.log('Showing image ' + annotation.image);
                        }
                    });

                    console.log('Received the following annotations');
                    //ans = _.map(ans, 'comment');
                    //console.log(ans);
                    //console.log('Pushing data for...');
                    //console.log(allPlottedCrops);
                    that.notifyObservers(ans, allPlottedCrops);
                });
            }

            this.writeAnnotations = function (chartModel, cropArr, data, response) {
                //alert('Starting to write annotations');
                //var username = $('#username').val();
                //console.log('User name being saved');
                //console.log(username);
                var errors = false;
                var message = ""
                if (cropArr.length === 0) {
                    errors = true;
                    message = message + "Missing crop selections <br/>";
                }

                if (data.length === 0) {
                    errors = true;
                    message = message + "Missing actual message";
                }

                console.log('Has errors...');
                console.log(errors);
                if (errors === false) {
                    var username = $('#username').text();
                    var image = $('#image').text();
                    console.log(image)
                    var url = "http://127.0.0.1:5000/annotationspost/" + chartModel + "/" + cropArr.join(",");
                    var options = {
                        method: 'POST',
                        url: url,
                        data: $.param({ comment: data, author: username, image:image }),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                    console.log('Logging to....');
                    console.log(url);
                    $('#error').html('');
                    $http(options).success(response);
                } else {
                    $('#error').html(message);
                }
                

                

                /*
                var d = {
                    comment: data,
                };
                console.log(url);
                var ajaxRequest = {
                    type: 'POST',
                    url: url,
                    data: d,
                    headers: {'Content-Type' : 'application/json'},
                    success: response
                };
                

                var ajaxRequest2 = {
                    type: 'GET',
                    url: url
                };

                console.log('Sending the request.....');
                $.ajax(ajaxRequest);
                
                /*
                $http.post(url, d).success(function (answer) {
                    console.log('We have successfully posted....')
                    console.log(answer);
                    response(answer);
                }); */

                console.log(that.annotationGetURI + chartModel + "/" + cropArr.join(","));
            }

        }]);

    app.controller('AnnotationController', [ '$scope' ,'AnnotationPersistenceService', 'ChartingService',
        function ($scope, AnnotationPersistenceService, ChartingService) {


            var that = this;
            $('#commentEditor').val('');
            $scope.comments = [];
            $scope.annotationCrops = [];
            $scope.checkedCrops = {
                crops: []
            };
            $scope.annotationColors = {};
            AnnotationPersistenceService.registerAnnotationObserver(function (data, cropsToAnnotate) {
                $scope.comments = data;
                console.log('Annotation raws...');
                console.log($scope.comments);
                $scope.annotationCrops = cropsToAnnotate;
                console.log(cropsToAnnotate);
                console.log('Crops active: ');
                console.log($scope.annotationCrops);
                var temp = ChartingService.getSeriesColors();
                for (var colorSet in temp) {
                    if (temp.hasOwnProperty(colorSet)) {
                        $scope.annotationColors[colorSet] =  temp[colorSet];
                    }
                }
                console.log($scope.annotationColors);
            });
            $scope.submitAnnotation = function () {
                console.log('Uses storing annotations for ....');
                console.log($scope.checkedCrops.crops);
                //alert($('#username').text());
                //alert(markdown.toHTML($('#commentEditor').val()));
                //$scope.comments.push(markdown.toHTML($('#commentEditor').val()));
                AnnotationPersistenceService.writeAnnotations(ChartingService.currentType,
                    //ChartingService.getActiveCrops(),
                    $scope.checkedCrops.crops,
                    markdown.toHTML($('#commentEditor').val()), function (answer) {
                        console.log('Pushing new annotation')
                        var newComment = {};
                        newComment.comment = markdown.toHTML($('#commentEditor').val());
                        newComment.author = $('#username').text();
                        newComment.commodity = $scope.checkedCrops.crops[0];
                        newComment.showImage = true;
                        newComment.image = $('#image').text();
                        $scope.comments.push(newComment);
                        console.log(newComment);
                        console.log(markdown.toHTML($('#commentEditor').val()));
                        $('#commentEditor').val('');
                    });


                // markdown.toHTML($('#commentEditor').val()
            }



        }]);

    // The controller to be used to select chart types 
    app.controller('ChartModelController', ['$scope', 'DataLoadingService', 'ChartingService',
        function ($scope, DataLoadingService, ChartingService) {
        
            $scope.active = 'line';
            $scope.isActive = function (modelName) {
                console.log($scope.active);
                return $scope.active === modelName;
            }


        $scope.selectChartingModel = function (modelName) {
            console.log('You clicked ' + modelName);
            ChartingService.switchServices(modelName);
            $scope.active = modelName;
        };

        

        }]);

    app.controller('ChartingController', ['$scope', 'DataLoadingService', 'ChartingService', 'AnnotationPersistenceService',
        function ($scope, DataLoadingService, ChartingService, AnnotationPersistenceService) {

            var that = this;
            $scope.crops = [];
            
            $scope.chartingManager = ChartingService;

            

            DataLoadingService.addCropObserver(function (d1) {
                
                $scope.crops = d1;

            })
            
            $scope.isActive = function (id) {
                return ChartingService.beingPlotted(id);
            }

            console.log('Here are the crops....');
            console.log($scope.crops);
            $scope.handleClick = function (id) {
                console.log('selected ' + id);
                ChartingService.handleClick(id);
                
                // Requests the annotation Persistence manager to reload the annotations
                // on the behalf of the AnnotationController
                var currentCrops = ChartingService.getActiveCrops();
                var currentModel = ChartingService.currentType;
                AnnotationPersistenceService.reloadAnnotations(currentModel, currentCrops);

            }

        }]);
    


















/* To be placed into the chartingService 
            //$scope.annotationManager = AnnotationPersistenceService;
            //$scope.allAnnotations = {};
            //$scope.relevantAnnotations = [];

            $scope.$watch('annotationManager.getAnnotations()', function (newValue) {
                $scope.allAnnotations = newValue;
                var temp = newValue[ChartingService.currentModel];
                $scope.relevantAnnotations = _.map(temp, 'comment');
            })

            $scope.$watch('chartingManager.currentModel', function (newValue) {
                var temp = $scope.allAnnotations[newValue];
                $scope.relevantAnnotations = _.map(temp, 'comment');
            })
            */


/*
        var that = this;
        this.currentModel = 'line';
        this.annotationsRoot = "http://127.0.0.1:5000/annotations/";
        this.chartTypes = ["line", "bubble"];
        this.annotations = {};
        this.chartTypes.forEach(function (model) {
            $http.get(that.annotationsRoot + model).success(function (data) {
                that.annotations[model] = data;
            })
        });

        this.getAnnotations = function() {
            return that.annotations;
        }
        */
