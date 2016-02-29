var ywApp = angular.module('ywApp', ['ngRoute']);

  // ROUTING  
  ywApp.config(function($routeProvider) {
        $routeProvider.when('/', {
          templateUrl: '../views/current.html',
          controller: 'CurrentCtrl as current'
        })
        .when('/fiveday/:location', {
          templateUrl: '../views/fiveday.html',
          controller: 'FiveCtrl as five'
        })
        .when('/about', {
          templateUrl: '../views/about.html',
          controller: 'AboutCtrl as about'
        })
        .otherwise('/', {
          template: '../views/current.html'
        });
    });

  // SERVICES

  // api request for users current location
  ywApp.factory('userLocation', function($http, $q) {
    
    var userData;
    var defer = $q.defer();

    return {
        getUserLocation: function() {
           
           var request = {
            json: true
           };

           $http({
            url: 'http://ipinfo.io',
            method: 'GET',
            params: request
           })
           .then(function(results){
             userData = results;
             console.log(userData);
             defer.resolve(userData);
           }, 
           function(error) {
            console.log(error);
           });

           return defer.promise;
        }

    };
  });

  // Service for updating location between controllers
  ywApp.service('currentLocation', function() {
    this.currentCity = 'Chicago, US';
  });

  // Service for getting 5 day forecast for location
  ywApp.factory('fiveDayForecast', function($http, $q) {
    var weather = {};
    var defer = $q.defer();

    return {
      getFiveDay: function(location) {
          var query = location;

          var request = {
            q: query,
            appid: '65efb18293ede5bb078c2a9cd2ac3ea3',
            units: 'imperial'
          };
          
          $http({
            url: 'http://api.openweathermap.org/data/2.5/forecast',
            method: 'GET',
            params: request
          })
          .then(function(results) {
            weather = results;
            defer.resolve(weather);
          },
          function(error) {
            console.log(error);
          });

          return defer.promise;
      }
    };
  });

  ywApp.factory('unitConversions', function() {
    return {
       // Converts pressure from atmospheres to inHg
        convertPressure: function(atm) {
          return ((atm / 760) * 29.9213).toFixed(2);
        },

        // Converts api provided wind units(degrees) to a direction
        convertWind: function(deg){
          switch(deg) {
            case deg>11.25 && deg<=33.75: return "NNE";
            case deg>33.75 && deg<56.25: return "ENE";
            case deg>56.25 && deg<78.75: return "E";
            case deg>78.75 && deg<101.25: return "ESE";
            case deg>101.25 && deg<123.75: return "ESE";
            case deg>123.75 && deg<146.25: return "SE";
            case deg>146.25 && deg<168.75: return "SSE";
            case deg>168.75 && deg<191.25: return "S";
            case deg>191.25 && deg<213.75: return "SSW";
            case deg>213.75 && deg<236.25: return "SW";
            case deg>236.25 && deg<258.75: return "WSW";
            case deg>258.75 && deg<281.25: return "W";
            case deg>281.25 && deg<303.75: return "WNW";
            case deg>303.75 && deg<326.25: return "NW";
            case deg>326.25 && deg<348.75: return "NNW";
            default: return "N"; 
          }
        },


    };
  });

  ywApp.factory('tempData', function() {
    var subArrays = [];
    var maxTemps = [];
    var minTemps = [];

    return {

      maxTemps: [],
       // Converts Kelvin to F
      convertF: function(temp) {
        return Math.round(9/5 * (temp - 273) + 32);  
      },

      // Converts K to C
      convertC: function(temp) {
        return Math.round(temp - 273.15);
      },
      // Rounds temps in an array
      roundArrOfTemps: function(arr) {
        var rounded = [];
        for(i = 0; i < arr.length; i++) {
            rounded.push(Math.round(arr[i]));   
        }
        return rounded;
      },

      // Builds array for finding high and low temps for the day
      getAllTemps: function(dataArr, newArr) {
        for(i = 0; i < dataArr.length; i++) {
            newArr.push(dataArr[i].main.temp);
        }
        return newArr;
      },

      // Makes 5 subarrays of days, each containing the days temps
      makeSubArrays: function(arr, newArr) {
        for(i = 0; i < arr.length; i++) {
            newArr.push(arr.splice(0, 8));   
        }

        return newArr;
      },

        // Get max temp for each subarray
      getMaxTempForDays: function(arr) { 
        for(i = 0; i < arr.length; i++) {
          var max = Math.max.apply(null, arr[i]);
          maxTemps.push(max);
        }  
        return maxTemps;
      },

      // Get min temp for each subarray
      getMinTempForDays: function(arr) {  
        for(i = 0; i < arr.length; i++) {
          var min = Math.min.apply(null, arr[i]);
          minTemps.push(min);
        }  
        return minTemps;
      }

    };
  });

  ywApp.factory('convertDates', function() {
    return {
      // Converts api provided date to usable format
      convertDate: function(date) {
        date = new Date(date * 1000);
        var hours = this.getHours(date);
        var minutes = this.getMinutes(date);
        return hours + ':' + minutes;
      },

      getFiveDates: function(date) {
        date = new Date(date * 1000);
        return date;
      },

      // Gets hours for time
      getHours: function(date) {
        var hours = date.getHours();

        if(hours > 12) {
          hours -= 12;
        }
        return hours;
      },

      // Gets minutes for time
      getMinutes: function(date) {
        var minutes = date.getMinutes();
        return minutes;
      },

      getMonthAndDay: function(date) {
        var a = new Date(date * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var aDate = a.getDate();

        return month + ' ' + aDate + ' ' + year; 
      }
    };
  });

  ywApp.factory('yodaText', function() {
    return {
       // Randomly chooses yoda response to weather
      getYodaText: function(weather) {

        var randNum = Math.floor(Math.random() * 5);

        switch(weather) {
          case "Clouds": return yodaTextData.clouds[randNum];
          case "Snow": return yodaTextData.snow[randNum];
          case "Rain": return yodaTextData.rain[randNum];
          case "Sun":
          case "Clear": return yodaTextData.clear[randNum];
          default: return "Perplexed, I am...";
        }
      }
    };
  });

  ywApp.factory('weatherImages', function() {
    return {
       findWeatherImg: function(weather) {
         return weatherImages[weather];
       }
    };
  });

  ywApp.factory('forecastBuild', function() {
    var forecast = [];
    return {
      buildForecastDays: function(arr) {
        for(var i = 0; i < arr.length; i += 8) {
          forecast.push(arr[i]);
        }
        return forecast;
      }
    };
  });


  // CONTROLLERS

  ywApp.controller('CurrentCtrl', ['$scope', 'userLocation', '$http', '$q', 'fiveDayForecast', '$location', 'currentLocation', 'unitConversions', 'tempData', 'convertDates', 'yodaText', 'weatherImages', function($scope, userLocation, $http, $q, fiveDayForecast, $location, currentLocation, unitConversions, tempData, convertDates, yodaText, weatherImages) {
    
    $scope.default = 1;
    $scope.sunRise = 'images/sunrise.png';
    $scope.yoda = 'images/yoda.svg';
 
    // Gets user's current location then sends get request for current weather at that location
    
    userLocation.getUserLocation().then(function(data){
      $scope.location = data.data.city + ', ' + data.data.country;
      $scope.getWeather($scope.location);
    });

    $scope.$watch('location', function() {
      currentLocation.currentCity = $scope.location;
    });
    

    $scope.getWeather = function(location) {
          
          var query = location;
          var weather = {};

          var request = {
            q: query,
            appid: '65efb18293ede5bb078c2a9cd2ac3ea3',
            units: 'imperial'
          };
          
          $http({
            url: 'http://api.openweathermap.org/data/2.5/weather',
            method: 'GET',
            params: request,
          })
          .then(function(results) { 
            weather = results;
            if(weather.data.weather) {
              $scope.organizeData(weather);
            } 
            else {
              $scope.message = "City not found.";
            }
               
          },
          function(error) {
            $scope.message = "Server error";
          });
        
    };

    // Formats and converts various weather data for binding 
    $scope.organizeData = function(data) {

      $scope.currentTempF = Math.round(data.data.main.temp);
      $scope.currentTempC = tempData.convertC(data.data.main.temp);
      $scope.weatherImg = data.data.weather[0].main;

      $scope.description = data.data.weather[0].description.charAt(0).toUpperCase() + data.data.weather[0].description.slice(1);
          
      $scope.getWeatherImg = weatherImages.findWeatherImg($scope.weatherImg);

      $scope.sunriseTime = convertDates.convertDate(data.data.sys.sunrise);
      $scope.sunsetTime = convertDates.convertDate(data.data.sys.sunset);

      $scope.windDir = unitConversions.convertWind(data.data.wind.deg);
      $scope.windSpeed = Math.round(data.data.wind.speed);
      $scope.humidity = data.data.main.humidity;
      $scope.pressure = unitConversions.convertPressure(data.data.main.pressure);

      $scope.yodaCast = yodaText.getYodaText($scope.weatherImg);
    };  
      
    // Clears location text displayed in input 
    $scope.clearText = function() {
      $scope.location = '';
    };

    $scope.changeView = function(location) {
      $location.path('/fiveday/' + location);
    };

  }]);

  //FIVE DAY FORECAST CONTROLLER

  ywApp.controller('FiveCtrl', ['$scope', '$routeParams', 'fiveDayForecast', '$location', 'currentLocation', 'unitConversions', 'tempData', 'convertDates', 'yodaText', 'weatherImages', 'forecastBuild', function($scope, $routeParams, fiveDayForecast, $location, currentLocation, unitConverions, tempData, convertDates, yodaText, weatherImages, forecastBuild) {
    $scope.location = currentLocation.currentCity;
    $scope.dataArr = [];
    $scope.maxTemps = [];
    $scope.minTemps = [];
    $scope.arrOfTemps = [];
    $scope.tempsEachDay = [];
    $scope.forecasts = [];
    $scope.yoda = 'images/yoda.svg';

    $scope.$watch('location', function() {
      currentLocation.currentCity = $scope.location;
    });

    $scope.getWeather = fiveDayForecast.getFiveDay($scope.location).then(function(data) {  
      $scope.dataArr = data.data.list;   

      // Since openweathermap api returns data in 3 hr intervals this pushes from the returned data array
      // the indexed value every 24 hours
      $scope.forecasts = forecastBuild.buildForecastDays($scope.dataArr);
      // Build arrays for daily high and low temps
      $scope.arrOfTemps = tempData.getAllTemps($scope.dataArr, $scope.arrOfTemps);
      $scope.subArrays = tempData.makeSubArrays($scope.arrOfTemps, $scope.tempsEachDay);
      $scope.maxTemps = tempData.getMaxTempForDays($scope.subArrays);
      $scope.maxTemps = tempData.roundArrOfTemps($scope.maxTemps);
      $scope.minTemps = tempData.getMinTempForDays($scope.subArrays);
      $scope.minTemps = tempData.roundArrOfTemps($scope.minTemps);
      console.log($scope.maxTemps);
      console.log($scope.minTemps);  
    });


    // Finds matching weather icon for weather
    $scope.findWeatherImg = weatherImages.findWeatherImg;

     // Randomly chooses yoda response to weather
    $scope.getYodaText = yodaText.getYodaText;

    $scope.getDate = convertDates.getMonthAndDay;

    $scope.changeViewCurrent = function() {
      $location.path('/');
    };

  }]);

  ywApp.controller('AboutCtrl', ['$scope', function(scope) {

  }]);

   

   

    

      
      
     

