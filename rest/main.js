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
	}, 'name', function (err, user) {
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

server.post('/trip', function (req, res, next) {

	var trip = new tripModel({
		name: req.params.name,
		flightId: req.params.flightId,
		userId: req.params.userId
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

	var request = require('request');

	// ?origin=JFK&destination=LAX&departuredate=2015-05-01&returndate=2015-05-05&onlineitinerariesonly=N&limit=10&offset=1&eticketsonly=N&sortby=totalfare&order=asc&sortby2=departuretime&order2=asc&pointofsalecountry=US
	var propertiesObject = { 
		'origin':'JFK',
		'destination':'LAX',
		'departuredate':'2015-05-01',
		'returndate':'2015-05-05',
		'onlineitinerariesonly':'N',
		'limit':'10',
		'offset':'1',
		'eticketsonly':'N',
		'sortby':'totalfare',
		'order':'asc',
		'sortby2':'departuretime',
		'order2':'asc',
		'pointofsalecountry':'US',
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
  		results: body
  	});
	});

});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});