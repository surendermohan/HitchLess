module.exports = function (mongoose, db) {

	var tripSchema = mongoose.Schema({
		name: 'String',
		userId: 'String'
	});
	
	var tripModel = db.model('Trip', tripSchema);

	return tripModel;
}