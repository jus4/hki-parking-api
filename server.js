const express = require('express');
const app = express();
const cron = require('node-cron');
const { port, environment, corsUrl } = require('./config');
const cors = require('cors');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const { ParkingLot } = require('./server/models');
const { findOne } = require('./server/models/parkingLots');

mongoose.connect('mongodb://localhost/parking', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Mongo db connected');
});

app.use(cors());

const findParking = async (id) => {
    const parkingArea = await ParkingLot.findOne({ referenceId: id});

    if (parkingArea) {
        return parkingArea
    }

    const newParkingLot = new ParkingLot({
        referenceId: id,
    });

    newParkingLot.save( function(err, document) {
        if (err) console.log(err)
        console.log(document)
    });

    return newParkingLot;
}


cron.schedule('15,30,45,59 * * * *', async function(){
    console.log('Fetch started');
    let url = 'https://pubapi.parkkiopas.fi/public/v1/parking_area_statistics/?page_size=2000';
    let settings = { method: "Get" };
    const data = await fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            return json;
            // do something with JSON
    });

    for (x = 0;x < data.results.length; x++) {
        const ParkingArea = await findParking(data.results[x].id);

        const parkingCount = ParkingArea.parkingHistory.length;
        const dataParkingCount = data.results[x].current_parking_count;

        if ( (parkingCount === 0 ) || (dataParkingCount !== ParkingArea.parkingHistory[ parkingCount - 1 ].parkingCount ) ) {
            ParkingArea.parkingHistory.push( { 
                parkingCount: data.results[x].current_parking_count,
                time: new Date(),
            });

            ParkingArea.save(function(err, document) {
                if (err) console.log(err)
                console.log(document);
            });
        }

    }

});



require('./server/routes')(app);




console.log(process.env.NODE_ENV);
console.log('Environment: ' + environment);
console.log('Port:' + port);
console.log('Cors url:' + corsUrl);
const PORT = port | 8000
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
