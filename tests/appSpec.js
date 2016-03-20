// var userLocationData = {
//         "data":  {
//           "city": "Northumberland",
//           "country": "US",
//           "hostname": "70.15.186.92.res-cmts.pnt.ptd.net",
//           "ip": "70.15.186.92",
//           "loc": "40.9258,-76.7568",
//           "org": "AS3737 PenTeleData Inc.",
//           "postal": "17857",
//           "region": "Pennsylvania"
//         }
//     };

var data = {
  "data": {
    "weather": [
      {"main": "Rain"} 
    ]
  }
};

  var arrOfTemps = [
        {
          "main": 
          {
            "temp": 56,
            "pressure": 991,
            "humidity": 86,
            "temp_min": 274.65,
            "temp_max": 277.45
          }
        },
        {
          "main": 
          {
            "temp": 44,
            "pressure": 991,
            "humidity": 86,
            "temp_min": 274.65,
            "temp_max": 277.45
          }
        },
        {
          "main": 
          {
            "temp": 61,
            "pressure": 991,
            "humidity": 86,
            "temp_min": 274.65,
            "temp_max": 277.45
          }
        }
      ];

var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
var subArrs = [[2, 1, 3, 4, 5, 8, 7, 6],[ 11, 10, 9, 12, 16, 14, 15, 13], [17, 18, 19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, 30, 31, 32],[ 33, 34, 35, 36, 37, 38, 39, 40]];


describe('Testing for ywApp module', function() {
  
  beforeEach(module('ywApp'));

  var scope, httpBackend, rootScope;

  beforeEach(inject(function($rootScope, $controller, $httpBackend, $location) {
    scope = $rootScope.$new();
    location = $location;
    rootScope = $rootScope;
    httpBackend = $httpBackend;
  }));

  xdescribe('Testing current location service', function() {
    it('should update location on change', inject(function(currentLocation) {
        expect(currentLocation.currentCity).toBe('');
        
        scope.location = "Northumberland, PA";
        scope.$digest();
        expect(currentLocation.currentCity).toBe('Northumberland, PA');

    }));
  });

  describe('Testing tempData factory', function() {
    
    it('should convert a temp in C to F', inject(function(tempData) {
      var tempF = 32;
      var newTemp = tempData.convertC(tempF);
      expect(newTemp).toBe(0);
      
      tempF = 84;
      newTemp = tempData.convertC(tempF);
      expect(newTemp).toBe(29);

      tempF = 62;
      newTemp = tempData.convertC(tempF);
      expect(newTemp).toBe(17);  

    }));

    it('should return an array of rounded numbers', inject(function(tempData) {
      var arr = [1.2, 2.7, 99.4, 23.4];
      var roundedArr = tempData.roundArrOfTemps(arr);
      expect(roundedArr.length).toBe(4);
      expect(roundedArr).toEqual([ 1, 3, 99, 23]);

      arr = [9.9, 22.7, 73.4, 2.4];
      roundedArr = tempData.roundArrOfTemps(arr);
      expect(roundedArr.length).toBe(4);
      expect(roundedArr).toEqual([ 10, 23, 73, 2]);

      arr = [17.2, 52.4, 73.9, 2.6];
      roundedArr = tempData.roundArrOfTemps(arr);
      expect(roundedArr.length).toBe(4);
      expect(roundedArr).toEqual([ 17, 52, 74, 3]);

    }));

    it('should get all the temps from an array of objects', inject(function(tempData) {
      var newArr = tempData.getAllTemps(arrOfTemps);
      expect(newArr.length).toBe(3);
      expect(newArr).toEqual([56, 44, 61]);
    }));

    it('should take an array of length 40 and create a new array with 5 subarrays. Each subarray should be a length of 8', inject(function(tempData) {
      var subArr = tempData.makeSubArrays(arr);

      expect(subArr.length).toBe(5);
      expect(subArr[0].length).toBe(8);
      expect(subArr[1].length).toBe(8);
      expect(subArr[2].length).toBe(8);
      expect(subArr[3].length).toBe(8);
      expect(subArr[4].length).toBe(8);

      expect(subArr[0]).toContain(8);
      expect(subArr[0]).not.toContain(9);

      expect(subArr[4]).toContain(33);
      expect(subArr[4]).not.toContain(32);
    }));

    it('should take a 2d array, find the max value for each subarray, then push those values to a new array', inject(function(tempData) {
      var highNums = tempData.getMaxTempForDays(subArrs);

      expect(highNums.length).toBe(5);
      expect(highNums[0]).toBe(8);
      expect(highNums[1]).toBe(16);
      expect(highNums[2]).toBe(24);
      expect(highNums[3]).toBe(32);
      expect(highNums[4]).toBe(40);
    }));

    it('should take a 2d array, find the min value for each subarray, then push those values to a new array', inject(function(tempData) {
      var lowNums = tempData.getMinTempForDays(subArrs);

      expect(lowNums.length).toBe(5);
      expect(lowNums[0]).toBe(1);
      expect(lowNums[1]).toBe(9);
      expect(lowNums[2]).toBe(17);
      expect(lowNums[3]).toBe(25);
      expect(lowNums[4]).toBe(33);
    }));
  });

  describe('Testing convertDates factory', function() {
    xit('should convert unix date into date then return the time', inject(function(convertDates) {
      var date = '1457073096';
      var hoursMins = convertDates.convertDate(date);

      expect(hoursMins).toBe('1:31');
    }));

    xit('should convert unix date to a date', inject(function(convertDates) {
      var date = '1457073096';
      var convertedDate = convertDates.getFiveDates(date);

      expect(convertedDate).toContain('Fri Mar 04 2016 01:31:36 GMT-0500 (EST)');
    }));

    it('Should find the month for the forecast day', inject(function(convertDates) {
        var date = '1457073096';
        var monthDateYear = convertDates.getMonthAndDay(date);

        expect(monthDateYear).toContain('Mar');
        expect(monthDateYear).toContain('2016');
    }));
  });

  xdescribe('Testing yodaText Factory', function() {
    it('should return a randomly selected yoda forecast based on weather', inject(function(yodaText) {
        var rainText = yodaText.getYodaText(data.data.weather[0].main);

        expect(rainText).toBeDefined();
    }));
  });



  describe('Testing currentCtrl controller', function() {
    var ctrl;

    beforeEach(inject(function($controller) {
      ctrl = $controller('CurrentCtrl', {$scope: scope});
    }));

    it('should have a default value of 1', function() {
      expect(scope.default).toBeDefined();
      expect(scope.default).toBe(1);
    });

    it('should contain sunrise image path', function() {
      expect(scope.sunRise).toBeDefined();
      expect(scope.sunRise).toBe('images/sunrise.png');
    });

    it('should contain yoda image path', function() {
      expect(scope.yoda).toBeDefined();
      expect(scope.yoda).toBe('images/yoda.svg');
    });

    it('should change scope.error to true', function() {
      expect(scope.error).toBeNull();
      scope.errorMsg();
      expect(scope.error).toBe(1);
    });

    it('should change location to an empty string', function() {
        scope.location = "New York, NY";
        expect(scope.location).toBe("New York, NY");

        scope.clearText();

        expect(scope.location).toBe('');
    });

    xit('should set the path to /fiveday/', function() {
       
       spyOn(location, 'path');
       location.path('/');
       expect(location, 'path').toBe('/');
       scope.changeView();
    });

    xit('should send get request for current location if one is not set', inject(function(currentLocation) {
        currentLocation.currentCity = '';
        expect(scope.location).toBe('');
    }));


  });

  
});
