var mongoose = require("mongoose");
var zonepriceSchema = require("../schemas/zonePrice");
var ZonePrice = mongoose.model('ZonePrice',zonepriceSchema);

module.exports = ZonePrice;