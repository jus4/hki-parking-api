const express = require('express');
const router = express.Router();
const { ParkingLot } = require('./models');

module.exports = function(app) {
    router.get('/parking/history', async function(req,res) {
        const parkingHistoryStats = await ParkingLot.find({$expr: {$gte: [{$size: "$parkingHistoryStats"}, 2]}});
        const stats = parkingHistoryStats.map( element => {
            return element.referenceId
        })
        res.json(stats);
    })

    router.get('/parking/stats/:id', async function(req,res) {
        const parkingAre = await ParkingLot.findOne({ referenceId:req.params.id});
        res.json(parkingAre);
    })    

    app.use('/api', router);
};