const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
var neo4j = require("neo4j-driver").v1;

const app = express();
app.use(morgan('combined'));
app.use(cors());

const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'password'));
const session = driver.session();

app.use(bodyParser.urlencoded({ extended: true }));
require('./routes')(app, session);

app.set('port', process.env.PORT || 8081);
app.listen(process.env.PORT || 8081, () => {
	console.log('Server live on 8081');
});