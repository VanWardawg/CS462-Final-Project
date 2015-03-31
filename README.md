# CS462-Final-Project
Delivery System
by: Erik Donohoo & Kevin Hinton
Overview
The system will be solving the problem of order and delivery as applied to a flower shop. The system will solve that problem by using an event driven architecture between a shop and a driver that will coordinate and manage the delivery of orders.
Event Architecture
Event domain: rfq
Event names: bid_available, delivery_ready, bid_awarded
Event Domain: delivery
Event Names: picked_up, complete
Apis
Twilio
Foursquare or Google Maps
Design Image

Overall Design
We will have two functioning apps.  A mobile web view for drivers, and a view for delivery shops to seek bids or submit orders for immediate pickup.  They will be event driven in nature.  Drivers can receive notifications when new bids become available, and shops get notified as the flowers make their way through the delivery process.  Both of these apps will be supported by our own RESTful API.  Twilio will be used to notify both shops and owners of events that occur, reminding them to check their apps.  And google maps will be used to determine approximate delivery times and availability for drivers.

