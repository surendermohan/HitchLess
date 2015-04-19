var express = require('express')
    , http = require('http')
    , path = require('path')
    , mongoose = require('mongoose');

var db = mongoose.createConnection('localhost', 'todo');
var todoSchema = mongoose.Schema({description:'String', body:'String', project:'String', context:'String', duedate:'String'});
var todoModel = db.model('Task', todoSchema);
var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use('/public',express.static(path.join(__dirname,'/public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', function(req,res){
    res.sendfile('index.html');
});

app.get('/index.html', function(req,res){
    res.sendfile('index.html');
});

app.get('/tripinfo.html', function(req,res){
    res.sendfile('tripinfo.html');
});

app.get('/checklist.html', function(req,res){
    res.sendfile('checklist.html');
});

app.get('/flightstatus.html', function(req,res){
    res.sendfile('flightstatus.html');
});

app.get('/otherflights.html', function(req,res){
    res.sendfile('otherflights.html');
});

/* list todo items */
app.get('/api/todo', function (req, res) {
    return todoModel.find(function (err, todos) {
        if (!err) {
            return res.send(todos);
        }
        else {
            return console.log(err);
        }
    });
});

/* list by id*/
app.get('/api/todo/:id', function (req, res) {
    return todoModel.findById(req.params.id, function (err, todo) {
        if (!err) {
            return res.send(todo);
        }
        else {
            return console.log(err);
        }
    });
});

/* create */
app.post('/api/todo', function (req, res){
    console.log(req.body);
    todo = new todoModel({
        description: req.body.description,
        body: req.body.body,
        project: req.body.project,
        context: req.body.context,
        duedate: req.body.duedate
    });
    todo.save(function (err) {
        if (!err) {
            return console.log("created");
        } else {
            return console.log(err);
        }
    });
    return res.send(todo);
});

/* update */
app.put('/api/todo/:id', function (req, res){
    return todoModel.findById(req.params.id, function (err, todo) {
        console.log(req.body);
        todo.description = req.body.description;
        todo.body = req.body.body;
        todo.project = req.body.project;
        todo.context = req.body.context;
        todo.duedate = req.body.duedate;
        return todo.save(function (err) {
            if (!err) {
                console.log("updated");
            } else {
                console.log(err);
            }
            return res.send(todo);
        });
    });
});

/* delete */
app.delete('/api/todo/:id', function (req, res){
    return todoModel.findById(req.params.id, function (err, todo) {
        return todo.remove(function (err) {
            if (!err) {
                console.log("removed");
                return res.send('');
            } else {
                console.log(err);
            }
        });
    });
});


var sabreOAuthToken = 'Shared/IDL:IceSess\/SessMgr:1\.0.IDL/Common/!ICESMS\/ACPCRTD!ICESMSLB\/CRT.LB!-0123456789012345678!123456!0!ABCDEFGHIJKLM!E2E-1';
var originIP = '199.231.242.26';

// Options for missed flight given a date
// using Sabre API
app.get('/flights', function (req, res, next) {

    console.log('params:' + JSON.stringify(req.query));

    var request = require('request');
    var dateFormat = require('dateformat');
    var now = new Date();   

    var timeWindow = dateFormat(now, 'UTC:hhmm') + '2359';
    console.log('date: ' + now);
    console.log('outbounddeparturewindow: ' + timeWindow);

    // ?origin=JFK&destination=LAX&departuredate=2015-05-01&returndate=2015-05-05&onlineitinerariesonly=N&limit=10&offset=1&eticketsonly=N&sortby=totalfare&order=asc&sortby2=departuretime&order2=asc&pointofsalecountry=US
    // Mandatory: origin, destination, return date (the same from the missed flight)
    var propertiesObject = { 
        'origin': req.query.origin,
        'destination': req.query.destination,
        'departuredate': now.toISOString().substring(0, 10), // UTC but only the date
        'returndate': req.query.returndate,
        'onlineitinerariesonly':'N',
        'limit':'10',
        'offset':'1',
        'eticketsonly':'N',
        'sortby':'totalfare',
        'order':'asc',
        'sortby2':'departuretime',
        'order2':'asc',
        'pointofsalecountry':'US',
        'outbounddeparturewindow' : timeWindow,
        'limit' : 5
    };

    request({
        method: 'GET',
        url:'https://api.test.sabre.com/v1/shop/flights', 
        headers: {
        'Authorization': 'Bearer ' + sabreOAuthToken,
        'X-Originating-Ip': originIP
    },
    qs: propertiesObject
    }, function(err, response, body) {// body has the results, but you have to JSON.parse it
        if(err) { 
            console.log(err); return; 
        }
        console.log("Get response: " + response.statusCode);

        var itineraries = JSON.parse(body).PricedItineraries;
        console.log(itineraries);

        var flights = [];

        itineraries.forEach(function (it, idx) {
            console.log('idx:' + idx + '-' + 'it:' + it);
            var s = it.AirItinerary.OriginDestinationOptions.OriginDestinationOption[0].FlightSegment[0];

            var myFlight = {
                number: s.FlightNumber,
                origin: s.DepartureAirport.LocationCode,
                destination: s.ArrivalAirport.LocationCode,
                departuretime: s.DepartureDateTime.substring(11),
                departuredate: s.ArrivalDateTime.substring(0,10),
                arrivaldate: s.ArrivalDateTime.substring(0,10),
                arrivaltime: s.ArrivalDateTime.substring(11)
            } 

            flights.push(myFlight);
        });

        res.send(flights);
    });

});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});