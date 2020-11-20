const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { ParkingLot } = require('./models');
const mongoose = require('mongoose');

module.exports = function(app) {
    router.get('/parking/locations', async function(req,res) {
        let url = "https://pubapi.parkkiopas.fi/public/v1/parking_area_statistics/e74a6f33-52c4-49c8-b6cb-e8ecec6e2ded";

        let settings = { method: "Get" };
        
        const data = await fetch(url, settings)
            .then(res => res.json())
            .then((json) => {
                console.log('test');
                return json;
                // do something with JSON
        });


        res.send(data);
    });

    router.get('/parking/stats/:id', async function(req,res) {
        const parkingAre = await ParkingLot.findOne({ referenceId:req.params.id});
        console.log(parkingAre)
        res.json(parkingAre);
    })    

    app.use('/api', router);
};