const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
    referenceId: String,
    parkingHistory: [],
    parkingHistoryStats: [],
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
