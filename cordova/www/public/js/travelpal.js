//'use strict';
var Geo={};
var appStartTime = 0;
var geoLocWatchId = 0; // geoLoc wathcing
var closestStoreDistance = 100000000000.0;
var closestStoreProximityMessage = null;
var closestStoreWelcomeMessage = null;
var closestStoreDealMessage = null;
var closestStorePropertyRadius = 0.0;
var closestStoreProximityRadius = 0.0;
var watchCounter = 0;
var intervalCurrentPostion = null; // variable to track interval timer to monitor current position
 
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
{
 <script type="text/javascript">alert('device ready...');</script>
  cordova.plugins.backgroundMode.enable();
  intialLoad();
  // Refer to https://github.com/christocracy/cordova-plugin-background-geolocation

/*
  registerNotificationPermission();
  <!-- notification callbacks -->
  cordova.plugins.notification.local.on('schedule', function (notification) {
    console.log('onschedule', notification.id);
    // showToast('scheduled: ' + notification.id);
  });

  cordova.plugins.notification.local.on('update', function (notification) {
    console.log('onupdate', notification.id);
    // showToast('updated: ' + notification.id);
  });
*/

  // Beacon monitoring: https://github.com/petermetz/cordova-plugin-ibeacon
  startBeaconMonitoring();
}

function intialLoad() {
  //alert('Welcome to TravelPal');
  appStartTime = new Date().getTime();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error, {timeout: 4000, enableHighAccuracy: true});
  }    

  //Get the latitude and the longitude;
  function success(position) {
    Geo.lat = position.coords.latitude;
    Geo.lng = position.coords.longitude;

    console.log('Lat long is: ' + Geo.lat + ', ' + Geo.lng);
	intervalCurrentPostion = setInterval(
	function() {
	  navigator.geolocation.getCurrentPosition(geolocationWatchSuccess, geolocationWatchError, {timeout: 4000, enableHighAccuracy: true});
	}, 
	5000);
  }

  function error(){
    console.log("Geocoder failed");
  }
}

function updateGeoLocations(lat, lng) {
  Geo.lat = lat;
  Geo.lng = lng;
}

function geolocationWatchSuccess(position) {
  updateGeoLocations(position.coords.latitude, position.coords.longitude);
  geolocationWatchSuccess_helper(position.coords.latitude, position.coords.longitude);
}
function geolocationWatchSuccess_helper(lat, lng) {
  //console.log('Latitude: '  + lat + '. ' + 'Longitude: ' + lng;
  var locationText = watchCounter + ': Latitude: '  + Geo.lat+ '. ' + 'Longitude: ' + Geo.lng;
  var currentTime = new Date().getTime();
  locationText += '. Diff=' + (currentTime - appStartTime) + ' current:' + currentTime +' , start: ' + appStartTime;
  
  // Ignore bogus callbacks during 30 seconds of startup.
  if ((currentTime = appStartTime) < 30000) {
    return;
  }

  console.log(locationText);
  //alert(currentTime + ' ' + lastDataTableReadTime);
  
}

function geolocationWatchError(error) {
  //alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
  console.log('ERROR code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
  //geoLocWatchId = navigator.geolocation.watchPosition(geolocationWatchSuccess,geolocationWatchError,{timeout: 5000, enableHighAccuracy: true});
}

/**
 * Function that creates a BeaconRegion data transfer object.
 * 
 * @throws Error if the BeaconRegion parameters are not valid.
 */
var uuid = 'dd32bc04-57a2-59fe-85cd-3df8dcb578ca';
var identifier = 'S2M Beacons'; // mandatory
var minor = 1; // optional, defaults to wildcard if left empty
var major = 2; // optional, defaults to wildcard if left empty

function createBeacon() {

  // throws an error if the parameters are not valid
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

  return beaconRegion;   
}

function startBeaconMonitoring() {
  var delegate = new cordova.plugins.locationManager.Delegate();

  delegate.didDetermineStateForRegion = function (pluginResult) {
    console.log('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
    //cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
  };

  delegate.didStartMonitoringForRegion = function (pluginResult) {
    //console.log('didStartMonitoringForRegion:', pluginResult);
    console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
  };

  delegate.didRangeBeaconsInRegion = function (pluginResult) {
    console.log('[DOM] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
  };

  //var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);

  cordova.plugins.locationManager.setDelegate(delegate);

  // required in iOS 8+
  cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
  // or cordova.plugins.locationManager.requestAlwaysAuthorization()

  cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
      .fail(console.error)
      .done();
  
  cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
    .fail(console.error)
    .done();
}

function stopBeaconMonitoring() {
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

  cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
    .fail(console.error)
    .done();
  
  //cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
  //  .fail(console.error)
  //  .done();
}

function onBleError(reason) {
  console.log("BLE ERROR: " + reason); // real apps should use notification.alert
}

function onDiscoverBleDevice(device) {
    console.log(JSON.stringify(device));
    var listItem = document.createElement('li');
    var html = '<b>' + device.name + '</b><br/>' + 'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' + device.id;
    listItem.innerHTML = html;
    //deviceList.appendChild(listItem);
}


