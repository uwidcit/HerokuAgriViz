var data = null;
            alert('Code running')
            var xhr = new XMLHttpRequest()
            var info_loc = 'http://localhost:5000/crops/daily/commodity/carrot'
            //document.getElementById('chart_box').innerHTML = 'The response is '
            xhr.open('GET', info_loc, true)
            xhr.onreadystatechange = function(x)
            {
                if (xhr.readyState == 4)
                {
                    alert('Got data and processing it.....')
                    data = eval(xhr.responseText)
                    alert('Data recieved ' + xhr.responseText)
                }
            }
            xhr.send()
            alert('sending')
            data = eval(xhr.responseText)
            alert('processed')
            alert(data)
            var chart_data = new Array()
            alert(data[0].date)
            alert(data[0].mean)
            
            alert('Processing individual entries now.....')
            for(var i = 0; i < data.length; i++)
            {
                //alert('inserting into chart data')
                x_val = new Date(data[i].date)  
                y_val = data[i].mean 
                //alert(x_val + " " + y_val)
                //alert(x_val + " " + y_val)
                //alert({x : x_val, y : y_val})
                chart_data.push({x : x_val, y : y_val})
            }
            
            alert('finished processing all entries .. ready for charting!')
            alert(chart_data)
            
            //var chart = new Contour({el : '.myFirstChart'})
            //.cartesian()
            //.line(chart_data)
            //.tooltip()
            //.render()
            
             
            
            
                
            
            
            
            //alert(xhr.statusText)
            //document.getElementById('chart_box').innerHTML = 'The response is ' + xhr.responseText
        </script>