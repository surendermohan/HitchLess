module.exports = function (mongoose, db) {

	var flightSchema = mongoose.Schema({
		number: 'String',
		departuredate: 'String',
		tripId: 'String'
	});
	
	var flightModel = db.model('Flight', flightSchema);

	return flightModel;
}