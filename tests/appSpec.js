var userLocationData = {
        "data":  {
          "city": "Northumberland",
          "country": "US",
          "hostname": "70.15.186.92.res-cmts.pnt.ptd.net",
          "ip": "70.15.186.92",
          "loc": "40.9258,-76.7568",
          "org": "AS3737 PenTeleData Inc.",
          "postal": "17857",
          "region": "Pennsylvania"
        }
    };

describe('Testing for ywApp module', function() {
  
  beforeEach(module('ywApp'));

  var scope, ctrl, httpBackend, rootScope;

  beforeEach(inject(function($rootScope, $controller, $httpBackend) {
    scope = $rootScope.$new();
    ctrl = $controller;
    rootScope = $rootScope;
    httpBackend = $httpBackend;
  }));

  // afterEach(function() {
  //   httpBackend.verifyNoOutstandingExpectation();
  //   httpBackend.verifyNoOutstandingRequest();
  // });

  // describe('Testing user location factory', inject(function(userLocation) {
  //   it('should get current user location', function() {
  //       var user = {};

  //       httpBackend.expect('GET', 'http://ipinfo.io?json=true').respond(userLocationData);
  //       userLocation.getUserLocation().then(function(data) {
  //         user = data;
  //       });
    
  //       httpBackend.flush();

  //       expect(user.data.city).toBe("Northumberland");
    
  //   });
  // }));

  it('Testing pressure conversion function', function() {
    var p = 797;

    

    expect(convertPressure(p)).toContain(31.38);
  });

  
});
