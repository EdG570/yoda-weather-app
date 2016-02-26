var ywApp = angular.module('ywApp', ['ngRoute']);

  ywApp.config(function($routeProvider) {
        $routeProvider.when('/', {
          templateUrl: '../views/current.html',
          controller: 'CurrentCtrl as current'
        })
        .when('/fiveday', {
          templateUrl: '../views/fiveday.html',
          controller: 'FiveCtrl as five'
        })
        .when('/yoda', {
          templateUrl: '../views/yoda.html',
          controller: 'YodaCtrl as yoda'
        })
        .otherwise('/', {
          template: '../views/current.html'
        });
    });

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
             defer.resolve(userData);
           });

           return defer.promise;
        }

    };
  });

  ywApp.factory('currentWeather', function($http, $q) {
    
    var weather = {};
    var defer = $q.defer();

    return {
      getCurrentWeather: function(city, ctry) {

          var query = city + ',' + ctry;


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
            defer.resolve(weather);
          });

          return defer.promise;
      }
    };
  });



  ywApp.controller('CurrentCtrl', ['$scope', 'userLocation', 'currentWeather', function($scope, userLocation, currentWeather) {
    $scope.default = 1;
    $scope.sunRise = 'images/sunrise.png';
    $scope.yoda = 'images/yoda.svg';
 
    userLocation.getUserLocation().then(function(data){
      console.log(data);

      $scope.location = data.data.city + ', ' + data.data.country;
      
      currentWeather.getCurrentWeather(data.data.city, data.data.country).then(function(data) {
        $scope.currentWeather = data;
        console.log($scope.currentWeather);

        $scope.currentTempF = convertF(data.data.main.temp);
        $scope.currentTempC = convertC(data.data.main.temp);
        $scope.weatherImg = $scope.currentWeather.data.weather[0].main;

        $scope.description = $scope.currentWeather.data.weather[0].description.charAt(0).toUpperCase() + $scope.currentWeather.data.weather[0].description.slice(1);
        console.log($scope.description);
        
        $scope.getWeatherImg = findWeatherImg($scope.weatherImg);

        $scope.sunriseTime = convertDate($scope.currentWeather.data.sys.sunrise);
        $scope.sunsetTime = convertDate($scope.currentWeather.data.sys.sunset);

        $scope.windDir = convertWind($scope.currentWeather.data.wind.deg);
        $scope.windSpeed = convertWindSpeed($scope.currentWeather.data.wind.speed);
        $scope.humidity = $scope.currentWeather.data.main.humidity;
        $scope.pressure = convertPressure($scope.currentWeather.data.main.pressure);

        $scope.yodaCast = getYodaText($scope.weatherImg);
      });  
    });

    

    function getYodaText(weather) {
      var clouds = ['Remain aloof today, the clouds will.', 
                    'Remain in hiding, the sun will.  Hmmmmmm.', 
                    'Clouds, clouds and more clouds.  Mention clouds did I, hmm?', 
                    'Where did the sun go, hmm?  Ahh, those pesky clouds.', 
                    'I wonder if clouds ever look down on us and say: "Hey, shaped like an idiot, look that one is!"'
                    ];

      var snow = ['Of shoveling snow two hours, hmm?  You mean free gym membership.  Hmmmmmm.',
                  ''];

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
      else if(weather === "Sun") {
        return sun[randNum];
      }
    }

    

    function convertF(temp) {
      return Math.round(9/5 * (temp - 273) + 32);
    }

    function convertC(temp) {
      return Math.round(temp - 273.15);
    }

    function changeDefault() {
      if($scope.default === 1) {
        return $scope.default = 0;
      } else {
        return $scope.default = 1;
      }
    }

    function findWeatherImg(weather) {
      if(weather === "Snow") {
        return 'images/snow.png';
      }
      else if(weather === "Clouds") {
        return 'images/cloudy.png';
      }
      else if(weather === "Rain") {
        return 'images/rain.png';
      }
      else if(weather === "Sun") {
        return 'images/sunny.png';
      }
    }

    function convertDate(date) {
      var date = new Date(date * 1000);
      var hours = getHours(date);
      var minutes = getMinutes(date);
      return hours + ':' + minutes;
    }

    function getHours(date) {
      var hours = date.getHours();

      if(hours > 12) {
        hours -= 12;
      }
      return hours;
    }

    function getMinutes(date) {
      var minutes = date.getMinutes();
      return minutes;
    }

    function convertWind(deg){
        if (deg>11.25 && deg<33.75){
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
    
    function convertWindSpeed(mps) {
      return  Math.round(mps / (1609.44/3600));
    }

    function convertPressure(atm) {
      return ((atm / 760) * 29.9213).toFixed(2);
    }

  }]);

