var ywApp = angular.module('ywApp', ['ngRoute']);
  
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

  ywApp.factory('fiveDayForecast', function($http, $q) {
    var weather = {};
    var defer = $q.defer();

    return {
      getFiveDay: function(location) {
          var query = location;

          var request = {
            q: query,
            appid: '65efb18293ede5bb078c2a9cd2ac3ea3'
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

  // Requests current weather for a given city and country
  // ywApp.factory('currentWeather', function($http, $q) {
    
  //   var weather = {};
  //   var defer = $q.defer();

  //   return {
  //     getCurrentWeather: function(location) {
  //         var query = location;

  //         var request = {
  //           q: query,
  //           appid: '65efb18293ede5bb078c2a9cd2ac3ea3'
  //         };
          
  //         $http({
  //           url: 'http://api.openweathermap.org/data/2.5/weather',
  //           method: 'GET',
  //           params: request
  //         })
  //         .then(function(results) {
  //           weather = results;
  //           defer.resolve(weather);
  //         },
  //         function(error) {
  //           console.log(error);
  //         });

  //         return defer.promise;
  //     }
  //   };
  // });



  ywApp.controller('CurrentCtrl', ['$scope', 'userLocation', '$http', '$q', 'fiveDayForecast', '$location', function($scope, userLocation, $http, $q, fiveDayForecast, $location) {
    
    $scope.default = 1;
    $scope.sunRise = 'images/sunrise.png';
    $scope.yoda = 'images/yoda.svg';
 
    // Gets user's current location then sends get request for current weather at that location
    
    userLocation.getUserLocation().then(function(data){
      $scope.location = data.data.city + ', ' + data.data.country;
      $scope.currentLocation = $scope.location;
      $scope.getWeather($scope.location);
    });
    

    $scope.getWeather = function(location) {

          $scope.currentLocation = location;
          
          var query = location;
          var weather = {};

          var request = {
            q: query,
            appid: '65efb18293ede5bb078c2a9cd2ac3ea3'
          };
          
          $http({
            url: 'http://api.openweathermap.org/data/2.5/weather',
            method: 'GET',
            params: request
          })
          .then(function(results) { 
            weather = results;
            if(weather.data.weather) {
              $scope.organizeData(weather);
            } else {
              $scope.message = "City not found.";
            }
               
          },
          function(error) {
            $scope.message = "Server error";
          });
        
    };

      // Formats and converts various weather data for binding 
      $scope.organizeData = function(data) {

          $scope.currentTempF = convertF(data.data.main.temp);
          $scope.currentTempC = convertC(data.data.main.temp);
          $scope.weatherImg = data.data.weather[0].main;

          $scope.description = data.data.weather[0].description.charAt(0).toUpperCase() + data.data.weather[0].description.slice(1);
          
          $scope.getWeatherImg = findWeatherImg($scope.weatherImg);

          $scope.sunriseTime = convertDate(data.data.sys.sunrise);
          $scope.sunsetTime = convertDate(data.data.sys.sunset);

          $scope.windDir = convertWind(data.data.wind.deg);
          $scope.windSpeed = convertWindSpeed(data.data.wind.speed);
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

  ywApp.controller('FiveCtrl', ['$scope', '$routeParams', 'fiveDayForecast', function($scope, $routeParams, fiveDayForecast) {
    $scope.location = $routeParams.location;
    $scope.maxTemps = [];
    $scope.yoda = 'images/yoda.svg';
    

    $scope.getFiveDay = fiveDayForecast.getFiveDay($scope.location).then(function(data) {
      
      var dataArr = data.data.list;
      console.log(dataArr);
      $scope.forecasts = [];

      // Since openweathermap api returns data in 3 hr intervals this pushes from the returned data array
      // the indexed value every 24 hours
      for(var i = 0; i < dataArr.length; i += 8) {
        $scope.forecasts.push(dataArr[i]);
      }

      getAllTemps(dataArr, makeSubArrays);

      $scope.maxTemps = maxTemps;
      $scope.minTemps = minTemps;

      console.log($scope.forecasts); 
      
    });

    $scope.findWeatherImg = function(weather) {
     return weatherImages[weather];
    };

     // Randomly chooses yoda response to weather
    $scope.getYodaText = function(weather) {

      var randNum = Math.floor(Math.random() * 5);

      if(weather === "Clouds") {
         return clouds[randNum];
      }
      else if(weather === "Snow") {
        return snow[randNum];
      }
      else if(weather === "Rain") {
        return rain[randNum];
      }
      else if(weather === "Sun" || weather === "Clear") {
        return clear[randNum];
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

  }]);

  ywApp.controller('AboutCtrl', ['$scope', function(scope) {
    
  }]);







  // Preparing temps for finding daily high and low temperature
  var arrOfTemps = [];
  var tempsEachDay = [];
  var maxTemps = [];
  var minTemps = [];

  // Builds array for finding high and low temps for the day
  function getAllTemps(dataArr, callback) {
      for(i = 0; i < dataArr.length; i++) {
        arrOfTemps.push(dataArr[i].main.temp);
      }

      callback(arrOfTemps, getMaxTempForDays, getMinTempForDays);
  }

  // Makes 5 subarrays, each containing the days temps for every 3 hrs
  function makeSubArrays(arrOfTemps, callbackOne, callbackTwo) {
      for(i = 0; i < arrOfTemps.length; i++) {
          tempsEachDay.push(arrOfTemps.splice(0, 8));   
      }

      callbackOne(tempsEachDay);
      callbackTwo(tempsEachDay);
  }

  // Get max temp for each subarray
  function getMaxTempForDays(temps, callback) { 
    for(i = 0; i < tempsEachDay.length; i++) {
      maxTemps.push(getMaxTemp(temps[i]));
    }
  }

  // Get min temp for each subarray
  function getMinTempForDays(temps, callback) {  
    for(i = 0; i < tempsEachDay.length; i++) {
      minTemps.push(getMinTemp(temps[i]));
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


  var clouds = ['Remain aloof today, the clouds will.', 
                'Remain in hiding, the sun will.  Hmmmmmm.', 
                'Clouds, clouds and more clouds.  Mention clouds did I, hmm?', 
                'Where did the sun go, hmm?  Ahh, those pesky clouds.', 
                'I wonder if clouds ever look down on us and say: "Hey, shaped like an idiot, look that one is!"'
                ];

  var snow = ['Snow? Hmmmm. Patience you must have my young padawan.',
              'Powerful it has become, the dark side I sense in snow',
              'Stock up on milk and bread, you better, hmmm?',
              'SNOW IS THE PATH TO THE DARK SIDE...SNOW LEADS TO ANGER...ANGER LEADS TO HATE...HATE LEADS TO SUFFERING',
              'Shovel the white stuff, we will. Do or do not, there is no try!'
              ];

  var clear = ['Time to look into the vast space above, it is!',
               'Have blue skies to negate those blue moods, we will.',
               'For a beer with a wookiee good day!  Herh herh herh',
               'Time to get out those sunglasses and light sabers, is it.  Yeesssssss.',
               'In a dark place we find ourselves, and a little more sun will light our way. Yes, hmmm.'
              ];

  var rain = ['Your Mogwais indoors keep!  Yeesssssss.',
              "Break those oxygen hydrogen bonds, even the force unable.",
              "A Jedi's strength flows from the force of water.",
              'May the force and an umbrella be with you.',
              'Flow like water on this day, A Jedi Master will. Yes, hmmm.'
              ];

  var fog = ['For Swamp Thing keep your eyes out!  Herh herh herh.'];

  // Randomly chooses yoda response to weather
  function getYodaText(weather) {

      var randNum = Math.floor(Math.random() * 5);

      if(weather === "Clouds") {
         return clouds[randNum];
      }
      else if(weather === "Snow") {
        return snow[randNum];
      }
      else if(weather === "Rain") {
        return rain[randNum];
      }
      else if(weather === "Sun" || weather === "Clear") {
        return clear[randNum];
      }
    }

    var weatherImages = {
      Snow: 'images/snow.png',
      Clouds: 'images/cloudy.png',
      Rain: 'images/rain.png',
      Sun: 'images/sunny.png',
      Clear: 'images/sunny.png',
      Hail: 'images/hail.png',
      Mix: 'images/mix.png',
      Sleet: 'images/hail.png',
      Wind: 'images/windy.png',
      Thunderstorms: 'images/thunderstorm.png',
    };

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
    // Use switch statement
    function convertWind(deg){
        if (deg>11.25 && deg<=33.75){
          return "NNE";
        }else if (deg>33.75 && deg<56.25){
          return "ENE";
        }else if (deg>56.25 && deg<78.75){
          return "E";
        }else if (deg>78.75 && deg<101.25){
          return "ESE";
        }else if (deg>101.25 && deg<123.75){
          return "ESE";
        }else if (deg>123.75 && deg<146.25){
          return "SE";
        }else if (deg>146.25 && deg<168.75){
          return "SSE";
        }else if (deg>168.75 && deg<191.25){
          return "S";
        }else if (deg>191.25 && deg<213.75){
          return "SSW";
        }else if (deg>213.75 && deg<236.25){
          return "SW";
        }else if (deg>236.25 && deg<258.75){
          return "WSW";
        }else if (deg>258.75 && deg<281.25){
          return "W";
        }else if (deg>281.25 && deg<303.75){
          return "WNW";
        }else if (deg>303.75 && deg<326.25){
          return "NW";
        }else if (deg>326.25 && deg<348.75){
          return "NNW";
        }else{
          return "N"; 
        }
    }
    
    // Converts wind speed from meters/sec to mph
    function convertWindSpeed(mps) {
      return  Math.round(mps / (1609.44/3600));
    }

    // Converts pressure from atmospheres to inHg
    function convertPressure(atm) {
      return ((atm / 760) * 29.9213).toFixed(2);
    }

