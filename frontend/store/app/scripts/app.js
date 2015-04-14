var app = angular.module('flowerStore', ['ngMaterial', 'ngRoute']);

var urlPrefix = 'http://52.0.11.73/backend/';

app.config(['$routeProvider', function ($route) {
	$route.otherwise({redirectTo: '/'});

	$route.when('/stores/:id', {
		templateUrl: 'views/store.html',
		controller: 'StoreCtrl'
	});

	$route.when('/drivers/:id', {
		templateUrl: 'views/driver.html',
		controller: 'DriverCtrl'
	});
}]);

app.factory('Maps', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
	var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
	var key = 'key'; // DONT PUSH TO GITHUB

	// lat,lon
	function getDistance(start, end) {
		return $http.get(urlPrefix + 'maps?' + 'origins=' + start + '&destinations=' + end)
		.then(function (response) {
			return $q.when(response.data.rows[0].elements[0].duration.value / 60);
		});
	}

	function getCurrentLocation() {
		var defer = $q.defer();

		if (!navigator.geolocation) {
			defer.reject('no location available');
			return defer.promise;
		}

		navigator.geolocation.getCurrentPosition(function (position) {
			defer.resolve(position.coords);
			$rootScope.$apply();
		});

		return defer.promise;
	}

	return {
		getDistance: getDistance,
		getCurrentLocation: getCurrentLocation
	};
}]);

app.controller('MainCtrl', ['$scope', '$mdMedia', '$http', '$mdSidenav',
function ($scope, $mdMedia, $http, $mdSidenav) {

	$scope.toggleMenu = function () {
		$mdSidenav('left').toggle();
	};

	$scope.$mdMedia = $mdMedia;

	// Get the stores
	$http.get(urlPrefix + 'shops')
	.success(function (stores) {
		$scope.stores = stores;
	});

	$http.get(urlPrefix + 'drivers')
	.success(function (drivers) {
		$scope.drivers = drivers;
	});
}]);

app.controller('StoreCtrl', ['$scope', '$http', '$routeParams',
function ($scope, $http, $params) {

	$http.get(urlPrefix + 'shops/' + $params.id)
	.success(function (store) {
		$scope.store = store;
	});

	$scope.shouldShowBids = function (order) {
		return order.status !== 'Bid Awarded' && order.status !== 'Complete';
	};

	$scope.awardedBid = function (bids, order) {
		if (!bids || !bids.length) return null;

		return bids.filter(function (bid) {
			return bid.id === order.awardedBid;
		})[0];
	};

	$scope.acceptBid = function (bid, order) {
		order.acceptedBid = bid.id;
		$http.put(urlPrefix + 'shops/' + $params.id + '/orders/' + order.id + '/bid/' + bid.id, bid)
		.success(function (b) {
			order.estimatedDeliverTime = bid.estimatedDeliveryTime;
			angular.extend(bid, b);

			// Refresh store
			$http.get(urlPrefix + 'shops/' + $params.id)
			.success(function (store) {
				$scope.store = store;
			});
		});
	};

	$scope.saveOrder = function (order) {
		order.createDate = new Date();
		$http.post(urlPrefix + 'shops/' + $params.id + '/orders', order)
		.success(function (o) {
			$scope.store.orders.push(o);
			$scope.newOrder = null;
		});
	};

	$scope.startOrder = function () {
		$scope.newOrder = {};
	};
}]);

app.controller('DriverCtrl', ['$scope', '$http', '$routeParams', 'Maps', '$q',
function ($scope, $http, $params, Maps, $q) {

	function init() {
		$http.get(urlPrefix + 'drivers/' + $params.id)
		.success(function (driver) {
			$scope.driver = driver;

			var orders = [], completed = [];
			$scope.deliveries = [];

			$scope.driver.orders.forEach(function (order) {

				if (order.awardedBid) {
					var b = order.bids.filter(function (bid) {
						return bid.id === order.awardedBid;
					})[0];

					if (b.driverId === $params.id) {
						if (order.status === 'Completed') {
							completed.push(order);
						} else {
							$scope.deliveries.push(order);
						}
					}
				} else {
					orders.push(order);
				}
			});

			$scope.completed = completed;
			$scope.driver.orders = orders;
		});
	}


	$scope.noPlacedBid = function (bids) {
		if (!bids || !bids.length) return true;

		return bids.every(function (bid) {
			return bid.driverId !== $params.id;
		});
	};

	$scope.myBid = function (bids) {
		return bids.filter(function (bid) {
			return bid.driverId === $params.id;
		})[0];
	};

	$scope.submitBid = function (order) {
		var bid = {
			estimatedDeliveryTime: new Date(Date.now() + (order.estimatedDeliveryTime * 60 * 1000)),
			driverName: $scope.driver.name
		};

		$http.post(urlPrefix + 'drivers/' + $params.id + '/orders/' + order.id + '/bid', bid)
		.success(function (b) {
			order.bids = order.bids || [];
			order.bids.push(b);
		});
	};

	$scope.complete = function (order) {
		order.actualDeliveryTime = new Date();
		$http.put(urlPrefix + 'drivers/' + $params.id + '/orders/' + order.id, order)
		.success(function () {
			init();
		});
	};

	$scope.calculateTime = function (order) {
		var time = 0, shop;
		order.calc = true;

		Maps.getCurrentLocation().then(function (coords) {
			$http.get(urlPrefix + 'shops/' + order.shopId)
			.then(function (s) {
				shop = s.data;
				return Maps.getDistance(coords.latitude + ',' + coords.longitude, shop.address);
			})
			.then(function (t) {
				console.log(t);
				return $q.when(order.estimatedDeliveryTime = t);
			})
			.then(function () {
				return Maps.getDistance(shop.address, order.address);
			})
			.then(function (t) {
				console.log(t);
				order.estimatedDeliveryTime += t;
				order.calc = false;
			});
		});
	};

	init();

}]);
