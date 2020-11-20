const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
    referenceId: String,
    parkingHistory: [],
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
