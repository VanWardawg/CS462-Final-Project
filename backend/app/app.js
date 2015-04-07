var express = require('express'),
	app = express();


var bodyParser = require('body-parser');
var uuid = require('node-uuid');

var request = require('request');
//Initialize a REST client in a single line:
var client = require('twilio')('sid', 'token');

// parse application/json
app.use(bodyParser.json())

app.set('view engine', 'html');

app.listen(3000);
var data = {};

data.shops = [ 
	{"id": "26d7e406-0c00-4b85-bb51-5ce814b4cc9a", "name":"Kevin's Awesome flower Shop", "orders":[], 
	"phoneNumber":"14802614333", "address":"345 E. 300 N. Provo UT, 84606"}
];

data.drivers = [
	{"id":"e0eb7037-92e7-45b2-bcd7-68e7883665d4", "phoneNumber":"14802614333", 
	"name": "Kevin Hinton", "orders":[], "bids":[], "ranking":10}
];

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.sendMessage = function (phoneNumber, message) {
	client.sendSms({
	    to: phoneNumber,
	    from:'Twilio_phonenumber',
	    body: message
	}, function(error, message) {
	    if (!error) {
	        console.log('Success! The SID for this SMS message is:');
	        console.log(message.sid);
	        console.log('Message sent on:');
	        console.log(message.dateCreated);
	    } else {
	        console.log('Oops! There was an error.');
	    }
	});
}

app.notifyEvent = function (event) {
	if (event.type == "rqf:delivery_ready") {
		driversRecieveEvent(event);
	}
	else if (event.type === "rqf:bid_available") {
		shopRecieveEvent(event);
	}
	else if (event.type === 'rqf:bid_awarded') {
		driversRecieveEvent(event);
	}
	else if (event.type === "delivery:complete") {
		shopRecieveEvent(event);
	}
}

function driversRecieveEvent(event) {

		for(var i = 0; i < data.drivers.length; i++) {
			if (event.type === 'rqf:bid_awarded') {
				if (data.drivers[i].id === event.bid.driverId) {
					app.sendMessage(data.drivers[i].phoneNumber, 'Bid awarded for order: ' + event.order.id);
					for (var j = 0; j < data.drivers[i].orders.length; j++) {
						if(data.drivers[i].orders[j].id === event.order.id) {
							data.drivers[i].orders[j] = event.order;
							break;
						}
					}
				}
				else {	
					for (var j = 0; j < data.drivers[i].orders.length; j++) {
						if(data.drivers[i].orders[j].id === event.order.id) {
							data.drivers[i].orders[j].splice(j, 1);
							break;
						}
					}
				}
			}
			else if (event.type == "rqf:delivery_ready") {
				app.sendMessage(data.drivers[i].phoneNumber, 'Delivery Available for Bid from shop: ' + event.shop.name);
				data.drivers[i].orders.push(event.order);
			}
		}
}

function shopRecieveEvent(event) {
	var message;
	for (var i = 0; i < data.shops.length; i++){
			if(data.shops[i].id === event.order.shopId) {
				for (var j = 0; j < data.shops[i].orders.length; j++) {
					if(data.shops[i].orders[j].id === event.order.id) {
						if(event.type === "rqf:bid_available") {
							data.shops[i].orders[j].bids = data.shops[i].orders[j].bids || [];
							data.shops[i].orders[j].bids.push(event.bid);
							message = "New bid available for order: " + data.shops[i].orders[j].id;
						}
						else if(event.type === 'delivery:complete') {
							data.shops[i].orders[j] = event.order;
							message = "Delivery Complete for order: " + event.order.id;
						}
						app.sendMessage(data.shops[i].phoneNumber, message);
						break;
					}
				}
			}
		}
}

require('./shops')(app, uuid, data, request);
require('./guild')(app, uuid, data, request);