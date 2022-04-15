import dotenv from 'dotenv';
import express from 'express';

dotenv.config({ silent: true });
var app = express();

app.use('/map', express.static('./src'));

var server=app.listen((process.env.APP_LISTEN_PORT || 5000), () => {
    console.log("The WepMap is listening on: "+server.address().port);
});