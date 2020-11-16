const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    corsUrl: process.env.CORS_URL
}