const express = require('express');
const app = express();
const cron = require('node-cron');
const {port, environment, corsUrl} = require('./config');

let index = 0;
cron.schedule('* * * * *', function() {
    console.log('running a task every minute' + index++ );
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
