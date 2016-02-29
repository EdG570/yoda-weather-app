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

  ywApp.service('currentLocation', function() {
    this.currentCity = 'Chicago, US';
  });

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


  // CONTROLLERS

  ywApp.controller('CurrentCtrl', ['$scope', 'userLocation', '$http', '$q', 'fiveDayForecast', '$location', 'currentLocation', function($scope, userLocation, $http, $q, fiveDayForecast, $location, currentLocation) {
    
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
      $scope.currentTempC = convertC(data.data.main.temp);
      $scope.weatherImg = data.data.weather[0].main;

      $scope.description = data.data.weather[0].description.charAt(0).toUpperCase() + data.data.weather[0].description.slice(1);
          
      $scope.getWeatherImg = findWeatherImg($scope.weatherImg);

      $scope.sunriseTime = convertDate(data.data.sys.sunrise);
      $scope.sunsetTime = convertDate(data.data.sys.sunset);

      $scope.windDir = convertWind(data.data.wind.deg);
      $scope.windSpeed = Math.round(data.data.wind.speed);
      $scope.humidity = data.data.main.humidity;
      $scope.pressure = convertPressure(data.data.main.pressure);

      $scope.yodaCast = getYodaText($scope.weatherImg);
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

  ywApp.controller('FiveCtrl', ['$scope', '$routeParams', 'fiveDayForecast', '$location', 'currentLocation', function($scope, $routeParams, fiveDayForecast, $location, currentLocation) {
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
      for(var i = 0; i < $scope.dataArr.length; i += 8) {
          $scope.forecasts.push($scope.dataArr[i]);
      }

      getAllTemps($scope.dataArr, makeSubArrays);  

    });

    $scope.maxTemps.forEach(function(t) {
        return Math.round(t);
    });

    // Finds matching weather icon for weather
    $scope.findWeatherImg = function(weather) {
     return weatherImages[weather];
    };

     // Randomly chooses yoda response to weather
    $scope.getYodaText = function(weather) {

      var randNum = Math.floor(Math.random() * 5);

      switch(weather) {
        case "Clouds": return yodaTextData.clouds[randNum];
        case "Snow": return yodaTextData.snow[randNum];
        case "Rain": return yodaTextData.rain[randNum];
        case "Sun":
        case "Clear": return yodaTextData.clear[randNum];
        default: return "Perplexed, I am...";
      }
    };

    $scope.getDate = function(date) {
      var a = new Date(date * 1000);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var aDate = a.getDate();

      return month + ' ' + aDate + ' ' + year; 
    };

    $scope.changeViewCurrent = function() {
      $location.path('/');
    };

   
    console.log($scope.maxTemps);

    // Builds array for finding high and low temps for the day
    function getAllTemps(dataArr, makeSubArrays) {
        for(i = 0; i < dataArr.length; i++) {
          $scope.arrOfTemps.push(dataArr[i].main.temp);
        }

        makeSubArrays($scope.arrOfTemps, getMaxTempForDays, getMinTempForDays);
    }

    // Makes 5 subarrays, each containing the days temps for every 3 hrs
    function makeSubArrays(arr, getMaxTempForDays, getMinTempForDays) {
        for(i = 0; i < arr.length; i++) {
            $scope.tempsEachDay.push(arr.splice(0, 8));   
        }

        getMaxTempForDays($scope.tempsEachDay, convertF);
        getMinTempForDays($scope.tempsEachDay, convertF);
    }

    // Get max temp for each subarray
    function getMaxTempForDays(arr, convertF) { 
      for(i = 0; i < arr.length; i++) {
        $scope.maxTemps.push(getMaxTemp(arr[i]));
      }  
    }

    // Get min temp for each subarray
    function getMinTempForDays(arr, convertF) {  
      for(i = 0; i < arr.length; i++) {
        $scope.minTemps.push(getMinTemp(arr[i]));
      }  
    }

     // Converts Kelvin to F
    function convertF(temp) {
      return Math.round(9/5 * (temp - 273) + 32);  
    }

    // Converts K to C
    function convertC(temp) {
      return Math.round(temp - 273.15);
    }

    //Get max temp for the day from the array
    function getMaxTemp(temps) {
      return Math.max.apply(null, temps);
    }

    function getMinTemp(temps) {
      return Math.min.apply(null, temps);
    } 

  }]);

  ywApp.controller('AboutCtrl', ['$scope', function(scope) {

  }]);

    // Converts K to C
    function convertC(temp) {
      return Math.round(temp - 273.15);
    }

    // Randomly chooses yoda response to weather
    function getYodaText(weather) {

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

    function findWeatherImg(weather) {
      return weatherImages[weather];
    }

    // Converts api provided date to usable format
      function convertDate(date) {
        date = new Date(date * 1000);
        var hours = getHours(date);
        var minutes = getMinutes(date);
        return hours + ':' + minutes;
      }

      function getFiveDates(date) {
        date = new Date(date * 1000);
        return date;
      }

      // Gets hours for time
      function getHours(date) {
        var hours = date.getHours();

        if(hours > 12) {
          hours -= 12;
        }
        return hours;
      }

      // Gets minutes for time
      function getMinutes(date) {
        var minutes = date.getMinutes();
        return minutes;
      }

      // Converts api provided wind units(degrees) to a direction
      function convertWind(deg){

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
      }
      
      // Converts pressure from atmospheres to inHg
      function convertPressure(atm) {
        return ((atm / 760) * 29.9213).toFixed(2);
      }

