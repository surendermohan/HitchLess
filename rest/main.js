var restify = require('restify'),
	mongoose = require('mongoose');

var db = mongoose.createConnection('localhost', 'db');

var server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

var sabreOAuthToken = 'Shared/IDL:IceSess\/SessMgr:1\.0.IDL/Common/!ICESMS\/ACPCRTD!ICESMSLB\/CRT.LB!-0123456789012345678!123456!0!ABCDEFGHIJKLM!E2E-1';
var originIP = '199.231.242.26';

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});


var tripModel = require('./models/trip')(mongoose, db);
var userModel = require('./models/user')(mongoose, db);

// USER

server.get('/user/:id/trips', function (req, res, next) {
	tripModel.find({
		userId: req.params.id
	}, function (err, result) {
		if (err) {
			console.log(err);
			return next(err);
		};
		res.send(result);
	}); 
  return next();
});

server.get('/users', function (req, res, next) {
	userModel.find(function (err, result) {
		if (err) {
			console.log(err);
			return next(err);
		};

		res.send(result);
	}); 
  return next();
});

server.get('/user/:email', function (req, res, next) {
	console.log(req.params);
	userModel.findOne({
		email: req.params.email
	}, function (err, user) {
		if (err) {
			console.log('ERROR:' + err);
			return next(err);
		};

		res.send(user);
	});
});

server.post('/user', function (req, res, next) {

	console.log('/user - ' + JSON.stringify(req.params));

	console.log('Searching user with email:' + req.params.email);
	userModel.findOne({
		email: req.params.email
	}, function (err, result) {

		if (err) {
			console.log('Error:' + err);
			return next(err);
		};

		if(result) {
			console.log('User with email: ' + req.params.email + ' found.');
			res.send(result);
			return next(result);
		}		

		console.log('Creating user:' + req.params.email);
		var user = new userModel({
			name: req.params.name,
			email: req.params.email,
			phone: req.params.phone
		});

		user.save(function (err) {
			if (err) {
				console.log(err);
				return;
			};
			console.log('New User:' + user.name + ' created.');
		});

		res.send(user);
  	return next();

	});
});

// TRIP
server.get('/trip/:id', function (req, res, next) {
	console.log(req.params);
	tripModel.findOne({
		_id: req.params.id
	}, 'name flightId', function (err, trip) {
		if (err) {
			console.log('ERROR:' + err);
			return next(err);
		};

		res.send(trip);
	});
});

server.post('/user/:id/trip', function (req, res, next) {

	console.log('user id: ' + req.params.id);
	var trip = new tripModel({
		name: req.params.name,
		userId: req.params.id
	});

	trip.save(function (err) {
		if (err) {
			console.log(err);
			return;
		};
		console.log('New Trip:' + trip.name + ' created.');
	});

  res.send(trip);
  return next();
});

server.get('/trips', function (req, res, next) {
	tripModel.find(function (err, result) {
		if (err) {
			console.log(err);
			return next(err);
		};

		res.send(result);
	}); 
  return next();
});

// Options for missed flight given a date
// using Sabre API
server.get('/flights', function (req, res, next) {

	console.log('params:' + JSON.stringify(req.params));

	var request = require('request');
	var dateFormat = require('dateformat');
	var now = new Date();	

	var timeWindow = dateFormat(now, 'UTC:hhmm') + '2359';
	console.log('date: ' + now);
	console.log('outbounddeparturewindow: ' + timeWindow);

	// ?origin=JFK&destination=LAX&departuredate=2015-05-01&returndate=2015-05-05&onlineitinerariesonly=N&limit=10&offset=1&eticketsonly=N&sortby=totalfare&order=asc&sortby2=departuretime&order2=asc&pointofsalecountry=US
	// Mandatory: origin, destination, return date (the same from the missed flight)
	var propertiesObject = { 
		'origin': req.params.origin,
		'destination': req.params.destination,
		'departuredate': now.toISOString().substring(0, 10), // UTC but only the date
		'returndate': req.params.returndate,
		'onlineitinerariesonly':'N',
		'limit':'10',
		'offset':'1',
		'eticketsonly':'N',
		'sortby':'totalfare',
		'order':'asc',
		'sortby2':'departuretime',
		'order2':'asc',
		'pointofsalecountry':'US',
		'outbounddeparturewindow' : timeWindow
	};

	request({
		method: 'GET',
		url:'https://api.test.sabre.com/v1/shop/flights', 
		headers: {
	    'Authorization': 'Bearer ' + sabreOAuthToken,
	    'X-Originating-Ip': originIP
  	},
		qs: propertiesObject
	}, function(err, response, body) {
  	if(err) { 
  		console.log(err); return; 
  	}
  	console.log("Get response: " + response.statusCode);
  	res.send({ok: 'Success!!',
  		results: JSON.parse(body)
  	});
	});

});

// FLIGHTS

// all flights for trip
server.get('/trip/:id/flights', function (req, res, next) {
	flightModel.find({
		tripId: req.params.id
	}, function (err, result) {
		if (err) {
			console.log(err);
			return next(err);
		};

		res.send(result);
	}); 
  return next();
});

// Associate a flight with a trip

var flightModel = require('./models/flight')(mongoose, db);

server.post('/trip/:id/flight', function (req, res, next) {

	console.log(req.params);

	tripModel.findOne({
		_id: req.params.id
	}, function (err, result) {
		if (err) {
			console.log('ERROR:' + err);
			return next(err);
		};

		console.log('Found:' + result);

		var flight = new flightModel({
			number: req.params.number,
			departuredate: req.params.departuredate,
			tripId: result._id
		});

		console.log('Saving flight-trip...');
		flight.save(function (err) {
			if (err) {
				console.log(err);
				return;
			};
			console.log('New Flight-Trip:' 
				+ flight.number 
				+ '-' + result._id
				+ ' created.');
		});
		
		res.send(flight);
	});
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});