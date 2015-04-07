module.exports = function(app, uuid, data, request, twilio){
	var shops = data.shops;

    app.get('/backend/shops', function (req, res) {
		res.send(shops);
	});

	app.post('/backend/shops', function (req, res) {
		var shop = req.body;
		shop.id = uuid.v4();
		shop.orders = shop.orders || [];
		shop.subscribers = shop.subscribers || [];
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

	function getOrder(id, shop) {
		for (var i = 0; i < shop.orders.length; i++) {
			if(shop.orders[i].id === id) {
				return shop.orders[i];
			}
		}
	}

	app.get('/backend/shops/:id', function (req, res) {
		var id = req.params.id;
		var shop = getShop(id);
		res.json(shop);
	});

	app.get('/backend/shops/:id/orders', function (req, res) {
		var id = req.params.id;
		var shop = getShop(id);
		res.json(shop.orders);
	});

	app.post('/backend/shops/:id/orders', function (req, res) {
		var order = req.body;
		if(!order.address) {
      		res.send(403, {"status": "error", "error:": "Order must have an address"});
      		return;
		}
		order.id = uuid.v4();
		var shop = getShop(req.params.id);
		order.shopId = shop.id;
		shop.orders.push(order);
		data.orders = data.orders || [];
		data.orders.push(order);
		var event = {
			"type":"rqf:delivery_ready",
			"order": order,
			"shop": shop
		};
		app.notifyEvent(event);
		res.json({"message":"Success"});
	});

	app.put('/backend/shops/:id/orders/:orderId/bid/:bidId', function (req, res) {
		var bid = req.body;
		var shop = getShop(req.params.id);
		var order = getOrder(req.params.orderId, shop);
		order.estimatedDeliveryTime = bid.estimatedDeliveryTime;
		var event = {
			"type":"rqf:bid_awarded",
			"order": order,
			"bid": bid
		};
		app.notifyEvent(event);	
		res.json({"message":"Success"});
	});

	function debug(msg){
		var debug = true;
		if(debug){
			console.log(msg);
		}
	}
}