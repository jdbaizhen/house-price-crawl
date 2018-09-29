var mongoose = require("mongoose");
var zoneSchema = new mongoose.Schema({
	district : String,
	villageName: String,
	villageKey : String,
	address : String,
	villageX : Number,
	villageY : Number,
	priceRate : {type : Object},
	priceNow : Number,
	avgPrice : Number,
	villageImage : String,
	property : String,
	developer : String,
	finishTime : String,
	green : String,
	houseHolds : String,
})


module.exports = zoneSchema;
