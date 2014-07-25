$(document).ready(
function()
    {
        var daily_crop_api = "http:\\localhost:5000\crop\daily\commodity"
var crop_name = daily_crop_api + "\carrot"
var info_loc = 'http://localhost:5000/crops/daily/commodity/carrot'
var data = null
var xhr = new XMLHttpRequest()
var prepare_data = function(str)
{
    data = eval(str)
}

var extract_data = function(data)
{
    var chart_data = new Array()
    for (var i = 0; i < data.length ; i++)
    {
        var x_val = new Date(data[i].date)
        var y_val = data[i].mean 
        var obj = {x : x_val, y : y_val}
        console.log(obj)
        chart_data.push(obj)
    }
    chart_data
}







xhr.onreadystatechange = function()
{
    if(xhr.readyState == 4)
    {
        console.log('Date received')
        data = prepare_data(xhr.responseText)
        console.log('Data parsed')
        data = extract_data(data)
        console.log('Extraction successful')
        
    }
}

xhr.open('GET', info_loc, false)
xhr.send()
    }

)