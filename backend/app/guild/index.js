module.exports = function(app, uuid, drivers, request){

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

	app.post('/drivers/events', function (req, res) {
		//guild
		var event = res.body;
		if (event.type == "rqf:delivery_ready") {
			
		}
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

	app.post('/drivers/:id/events', function (req, res) {
		// listen for specific events
	});

	app.post('/drivers/:id/orders', function (req, res) {
		var order = req.body;
		order.id = uuid.v4();
	});
}