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

  beforeEach(injection(function($rootScope, $controller, $httpBackend) {
    scope = $rootScope.$new();
    ctrl = $controller;
    rootScope = $rootScope;
  }));

  afterEach(function() {
    httpBackend.verifyNoOutstandingRequest();
  })

  describe('Testing userLocation factory', function() {
    it('should get current user location', function() {
        var user = {};

        httpBackend.expect('GET', 'http://ipinfo.io?json=true').respond(userLocationData);
        userLocation.getUserLocation().then(function(response) {
          user = response;
          console.log(user);
        });
    
        httpBackend.flush();

        expect(user.city).toBe("Northumberland");
    
    });
  });

  
});
