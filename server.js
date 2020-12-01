const express = require('express');
const app = express();
const cron = require('node-cron');
const { port, environment, corsUrl } = require('./config');
const cors = require('cors');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const { ParkingLot } = require('./server/models');

mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});
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

// Average time testing
const  setAverageStats = async (id) => {
   const parkingArea = await ParkingLot.findById(id);
   let update = [];
   const stats = parkingArea.parkingHistory;

   if ( stats.length == 0 || stats.parkingHistory === 'undefined') {
       return;
   }
  
   const groupByDate = stats.reduce( function(acc, obj) {
        let time = new Date(obj.time);
        let key = time.toLocaleDateString();
        if (!acc[key]) {
            acc[key] = []
        }
        acc[key].push(obj)
        return acc
   },{});

   // Set average parking by day
   const countAverage = Object.keys(groupByDate).map(key => {
        const records = groupByDate[key].length;
        const obj = groupByDate[key];
        let count = 0;
        for (let index = 0; index < records; index++) {
            if ( obj[index].parkingCount > 0 ) {
                count = count + parseInt(obj[index].parkingCount);
            }
        }
        
        const dateParts = key.split('/')
        const newDate = new Date(+dateParts[2], dateParts[0] - 1, +dateParts[1] +1 ); // For some reason the day is one day off, because of locale
        update.push({ time: newDate, parkingAverage: Math.ceil((count / records)) });
   })
   parkingArea.parkingHistory = [];
   parkingArea.parkingHistoryStats = [...parkingArea.parkingHistoryStats, ...update];
   parkingArea.save();

}


cron.schedule('0 21 * * *', async function(){
    ParkingLot.find( {}, function( err, parkingLots) {
        parkingLots.forEach( parkingLot => {
            console.log(parkingLot);
            setAverageStats(parkingLot._id);
        })
    })
})

cron.schedule('15,30,45,59 8-18 * * *', async function(){
    console.log('Fetch started');
    let url = 'https://pubapi.parkkiopas.fi/public/v1/parking_area_statistics/?page_size=2000';
    let settings = { method: "Get" };
    const data = await fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            return json;
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
