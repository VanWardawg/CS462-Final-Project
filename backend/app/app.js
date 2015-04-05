var express = require('express'),
	app = express();


var bodyParser = require('body-parser');
var uuid = require('node-uuid');

var request = require('request');
//Initialize a REST client in a single line:
var client = require('twilio')('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');
 
// Use this convenient shorthand to send an SMS:
// client.sendSms({
//     to:'YOUR_PHONE',
//     from:'TWILIO_NUMBER',
//     body:'ahoy hoy! Testing Twilio and node.js'
// }, function(error, message) {
//     if (!error) {
//         console.log('Success! The SID for this SMS message is:');
//         console.log(message.sid);
//         console.log('Message sent on:');
//         console.log(message.dateCreated);
//     } else {
//         console.log('Oops! There was an error.');
//     }
// });


// parse application/json
app.use(bodyParser.json())

app.set('view engine', 'html');

app.listen(3000);

var shops = [ 
	{"id": "26d7e406-0c00-4b85-bb51-5ce814b4cc9a", "orders":[], 
	"phoneNumber":"14802614333", "address":"345 E. 300 N. Provo UT, 84606",
	"url":"http://localhost:3000/shops/26d7e406-0c00-4b85-bb51-5ce814b4cc9a/events",
	"subscribers":["http://localhost:3000/drivers/events"]}
];

var drivers = [
	{"id":"e0eb7037-92e7-45b2-bcd7-68e7883665d4", "name": "Kevin Hinton", "orders":[], "bids":[], "ranking":10}
];
app.get('/', function (req, res) {
  res.send('Hello World!');
});

require('./shops')(app, uuid, shops, request);
require('./guild')(app, uuid, drivers, request);