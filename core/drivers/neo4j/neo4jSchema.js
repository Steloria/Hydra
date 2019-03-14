const Schema = require('../schema');
const Table = require('../table');
const fs = require('fs');

const Neo4JNodeApi = require('./api/node/neo4JNodeApi');

module.exports = class Neo4JSchema extends Schema {
	export(output) {}

	getAvailableAPI() {
		return {
		    Node: Neo4JNodeApi
		}
	}
};

exports.Neo4JNodeApi = Neo4JNodeApi;