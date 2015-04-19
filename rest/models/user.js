module.exports = function (mongoose, db) {

	var userSchema = mongoose.Schema({
		name: 'String',
		email: 'String',
		phone: 'String'
	});
	
	var userModel = db.model('User', userSchema);

	return userModel;
}