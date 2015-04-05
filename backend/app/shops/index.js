module.exports = function(app, uuid, shops, request){


    app.get('/shops', function (req, res) {
		res.send(shops);
	});

	app.post('/shops', function (req, res) {
		var shop = req.body;
		shop.id = uuid.v4();
		shop.orders = shop.orders || [];
		shop.subscribers = shop.subscribers || [];
		shop.url = "http://localhost:3000/shops/" + shop.id + "/events";
		shops.push(shop);
		res.json(shop)
	});

	function getShop(id) {
		var shop;
		for (var i = 0; i < shops.length; i++) {
			if (shops[i].id === id) {
				shop = shops[i];
				break;
			}
		}
		return shop;
	}

	app.get('/shops/:id', function (req, res) {
		var id = req.params.id;
		var shop = getShop(id);
		res.json(shop);
	});

	app.get('/shops/:id/orders', function (req, res) {
		var id = req.params.id;
		var shop = getShop(id);
		res.json(shop.orders);
	});

	app.put('/shops/:id/orders/:orderId', function (req, res) {
		var shop = getShop(req.params.id);
	});

	app.post('/shops/:id/orders', function (req, res) {
		var order = req.body;
		order.id = uuid.v4();
		var shop = getShop(req.params.id);
		shop.orders.push(order);
		var event = {
			"type":"rqf:delivery_ready",
			"order": order,
			"shop": shop
		};
		notifyEvent(event, shop);
	});

	app.post('/shops/:id/events', function (req, res) {
		// listen for specific events
	});

	app.post('/shops/:id/subscribe', function (req, res) {
		var id = req.params.id;
		var shop = getShop(id);
		shop.subscribers.push(req.body);
	});

	function debug(msg){
		var debug = true;
		if(debug){
			console.log(msg);
		}
	}

	function notifyEvent(event, shop) {
		for(var i = 0; i < shop.subscribers.length; i++) {
			try{
				request.post(shop.subscribers[i],{form:event});
			}catch(e){
				debug("Error:" + e);
			}
		}
	}
}