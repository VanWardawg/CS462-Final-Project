module.exports = function(app, uuid, data, request, twilio){
	var drivers = data.drivers

    app.get('/drivers', function (req, res) {
		res.send(drivers);
	});

	app.post('/drivers', function (req, res) {
		var driver = req.body;
		driver.id = uuid.v4();
		driver.orders = [];
		driver.url = "http://localhost:3000/drivers/" + driver.id + "/events";
		drivers.push(driver);
		res.json(driver)
	});

	function getdriver(id) {
		var driver;
		for (var i = 0; i < drivers.length; i++) {
			if (drivers[i].id === id) {
				driver = drivers[i];
				break;
			}
		}
		return driver;
	}

	app.get('/drivers/:id', function (req, res) {
		var id = req.params.id;
		var driver = getdriver(id);
		res.json(driver);
	});

	app.get('/drivers/:id/orders', function (req, res) {
		var id = req.params.id;
		var driver = getdriver(id);
		res.json(driver.orders);
	});

	function getOrder(id, driver) {
		if(driver == null)
			return;
		for(var i = 0; i < driver.orders.length; i++) {
			if(driver.orders[i].id === id) {
				return driver.orders[i];
			}
		}
		return null;
	}

	app.post('/drivers/:id/orders/:orderId/bid', function (req, res) {
		var driver = getdriver(req.params.id);
		var order = getOrder(req.params.orderId, driver);
		var bid = req.body;
		bid.id = uuid.v4();
		bid.driverId = driver.id;
		if (order != null) {
			var event = {
				"type":"rqf:bid_available",
				"order": order,
				"bid": bid
			};
			app.notifyEvent(event);
			res.json(bid);
		}
		else {
			res.json({"message":"order is unavailable"})
		}
	});

	function adjustRanking(driver, order) {
		var estimatedTime = new Date(order.estimatedDeliveryTime);
		var actualTime = new Date(order.actualDeliveryTime);
		var diffMs = (actualTime - estimatedTime); // milliseconds between now & Christmas
		var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
		if(diffMins < 0) {
			driver.ranking++;
		}
		else if (diffMins >=0 && diffMins < 4) {
			driver.ranking+= .5;
		}
		else if (diffMins >=4 && diffMins < 10) {
			driver.ranking-= .5;
		}
		else {
			driver.ranking--;
		}
		if (driver.ranking >= 15) {
			driver.ranking = 15;
		}
		else if(driver.ranking <= 0) {
			driver.ranking = 0;
		}
	}

	app.put('/drivers/:id/orders/:orderId', function (req, res) {
		var driver = getDriver(req.params.id);
		var order = req.body;
		var event = {
			"type":"delivery:complete",
			"order": order
		};
		adjustRanking(driver, order);
		app.notifyEvent(event);
		res.json({"message":"Success"});
	});
}