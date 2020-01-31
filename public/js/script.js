var gV = {
    toggled: true,
}

var coords = {
    lat: 1.2921,
    long: 36.8219
}

$(function() {
    $('.datepicker').datepicker({                   // search for weather in the past 
        endDate: '0d',
        autoclose: true,
        todayHighlight: true, todayBtn: true
    })
    getWeather(coords.lat, coords.long);

    $('button[name="search"]').on('click', function() {
        var date = $('input[name="input-field"]').val()

        var unixTime = moment(date).unix();

        $.getJSON('https://api.forecast.io/forecast/7af1baf9cee61c526daf8dc955092eda/' + coords.lat + ',' + coords.long + ',' + unixTime + '?callback=?', function(data) {
            drawOnDOM(data)
            console.log(data)
        })
    })
})

function success(data) {
    $("section").show();
    console.log(data.coords.latitude);
    getWeather(data.coords.latitude, data.coords.longitude);
    getLocationInfo(null, data.coords.latitude, data.coords.longitude);
}

function error(err) {
    console.log("error", err);
    //allow user to input data
    geoFail();
}

function drawOnDOM(wData) {
    
    //get main current icon (working!)
    var current_icon = wData.currently.icon.toUpperCase();

    //create icon objects for current weather
    var skycon = new Skycons({
        "color": "black"
    });
    var windIcon = new Skycons({
      "color": "black"
    });
    var rainIcon = new Skycons({
      "color": "black"
    });

    //add the skyccon icon types
    skycon.add("skycon", current_icon);
    rainIcon.add("rain-canvas", "rain");
    windIcon.add("wind-canvas", "wind");

    //play the icons
    skycon.play();
    windIcon.play();
    rainIcon.play();


    var rainProb = wData.currently.precipProbability * 100;                  // get precipe probability
    var windSpeed = Math.round(wData.currently.windSpeed * 1.7);            // get windspeed and convert to kilometres per hour 
    var app_temp = Math.round(wData.currently.apparentTemperature);         // get the current apparent temperature 
    var curTimezone = wData.timezone                                        // get the timezone                                    
    var dateNow = moment.unix(wData.currently.time).format("DD/MM/YYYY HH:mm")        // get the current date and time
    
    var hourView = wData.hourly.data
    var dist = hourView
    console.log(hourView)
     

    tempScale(wData.currently.temperature);
    tempToggle(wData.currently.temperature, app_temp, wData.daily.data);

    $("#timezone").html("Current timezone : " + curTimezone)
    $("#timeNow").html("the date today is: " + dateNow)
    $("#description").html(wData.currently.summary);
    $("#rain").html(rainProb + "%");
    $("#wind").html(windSpeed + " Kmh");
    $("#app-temp").html("The temperature today is: " + app_temp + "&deg;");
    populateForecast(wData.daily.data);

    $("section").show();

    setTempPosition();

}

function getWeather(lat, lon) {
    $.getJSON("https://api.forecast.io/forecast/7af1baf9cee61c526daf8dc955092eda/" + lat + "," + lon + "?callback=?",
        function(data) {
drawOnDOM(data)
         });
}
 
function populateForecast(forecast_arr) {
    var date;
    var day_arr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var forecast_days;
    var height;
    var temp;
    var color;

    //populating names of days
    date = new Date;
    date = date.getDay();

    //populate icons and temperature
    for (var i = 1; i <= 5; i++) {
        forecast_days = date + i;
        if (forecast_days > 6) {
            forecast_days -= 7;
        }
        $(".day-container" + i + " p").html(day_arr[forecast_days]);
        //end days
        var mini_icon = new Skycons({
            "color": "black"
        })
        mini_icon.add("canvas" + i, forecast_arr[i].icon);
        mini_icon.play();
        //temperature
        $(".day-container" + i + " span").html(Math.round(forecast_arr[i].temperatureMax) + "&deg;F");
        //make the color and fill heights for mini scale
        temp = Math.round(forecast_arr[i].temperatureMax);
        if (temp >= 0 && temp < 60) {
            color = "#5daefe";
        } else if (temp >= 60 && temp < 80) {
            color = "#5dfeae";
        } else if (temp >= 80 && temp < 90) {
            color = "#feae5d";
        } else {
            color = "#fe5d5d";
        }
        height = forecast_arr[i].temperatureMax;
        $(".day-container" + i + " .mini-fill").css({
            "height": height,
            "background-color": color
        });
    }
}


//working
function tempToggle(tempInF, app_temp, forecast_arr) {
    tempInF = Math.round(tempInF);
    var tempInC = Math.round((tempInF - 32) * (5 / 9));
    var app_tempInC = Math.round((app_temp - 32) * (5 / 9));
    var tempElement = document.getElementById('temp');
    tempElement.innerText = tempInF;
    tempElement.innerHTML += "&deg;F";
    //attach click handler to toggle to/from F/C
    $("#temp").click(function() {
        if (gV.toggled === true) {
          $("#app-temp").html("Feels like: " + app_tempInC + "&deg;");

            tempElement.innerText = tempInC;
            tempElement.innerHTML += "&deg;C";
            for (var i = 1; i <= 5; i++) {
                tempC = Math.round((forecast_arr[i].temperatureMax - 32) * (5 / 9));
                $(".day-container" + i + " span").html(tempC + "&deg;C");
            }
            gV.toggled = false;
        } //end if statement
        else if (gV.toggled === false) {
          $("#app-temp").html("Feels like: " + app_temp + "&deg;");

            tempElement.innerText = tempInF;
            tempElement.innerHTML += "&deg;F";
            for (var j = 1; j <= 5; j++) {
                $(".day-container" + j + " span").html(Math.round(forecast_arr[j].temperatureMax) + "&deg;F");
            }
            gV.toggled = true;
        }
    });
}


//working
function tempScale(temp) {
    //convert temperature into a usable height
    var fill_height = Math.round(temp * 1.7);
    var color;
    temp = Math.round(temp);

    var applyCSS = () => {
        $("#fill").css({
            "background-color": color,
            "height": fill_height
        });
      }

    if (temp >= 0 && temp < 60) {
        color = "#5daefe";
        applyCSS();
    } else if (temp >= 60 && temp < 80) {
        color = "#5dfeae";
        applyCSS();
    } else if (temp >= 80 && temp < 90) {
        color = "#feae5d";
        applyCSS();
    } else {
        color = "#fe5d5d";
        applyCSS();
    }
}

function setTempPosition() {
  var arrowLoc = $("#fill").offset();
  var p_height = $("#temp").height();
  var scale_width = $(".scale").width();
  console.log(arrowLoc);
  $(".temp").offset({top: arrowLoc.top - p_height / 2, left: arrowLoc.left + scale_width});
   $("#temp").offset({top: arrowLoc.top - p_height / 2, left: arrowLoc.left + scale_width + 20})
}


Highcharts.chart('charts', {
    chart: {
      type: 'spline'
    },
    title: {
      text: 'Todays Temperature'
    },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      title: {
        text: 'Temperature'
      },
      labels: {
        formatter: function () {
          return this.value + '°';
        }
      }
    },
    tooltip: {
      crosshairs: true,
      shared: true
    },
    plotOptions: {
      spline: {
        marker: {
          radius: 4,
          lineColor: '#666666',
          lineWidth: 1
        }
      }
    },
    series: [{
      name: 'Nairobi',
      marker: {
        symbol: 'square'
      },
      data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, {
        y: 26.5,
        marker: {
          symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)'
        }
      }, 23.3, 18.3, 13.9, 9.6]
  
    }]
  });