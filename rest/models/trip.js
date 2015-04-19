module.exports = function (mongoose, db) {

	var tripSchema = mongoose.Schema({
		name: 'String',
		flightId: 'String'
	});
	
	var tripModel = db.model('Trip', tripSchema);

	return tripModel;
}