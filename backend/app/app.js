var express = require('express'),
	app = express();

app.set('view engine', 'html');
app.use(express.bodyParser());

app.listen(3000);
