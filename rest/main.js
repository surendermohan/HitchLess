var restify = require('restify'),
	mongoose = require('mongoose');

var db = mongoose.createConnection('localhost', 'db');

var server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});


var tripSchema = mongoose.Schema({
	name: 'String'
});
var tripModel = db.model('Trip', tripSchema);

server.post('/trip', function (req, res, next) {

	var trip = new tripModel({
		name: req.params.name
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

server.get('/trip/:id', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});