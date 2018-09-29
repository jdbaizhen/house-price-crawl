var mongoose = require('mongoose');
var areaSchema = new mongoose.Schema({
	district : String,
	areaVillage : Number
})

module.exports = areaSchema;