const MongoDBSchema = require('./mongodb/mongodbSchema');
const MySQLSchema = require('./mysql/mysqlSchema');
const Neo4JSchema = require('./neo4j/neo4jSchema');

exports.getAvailableDrivers = () => ({
    MongoDB: MongoDBSchema,
    MySQL: MySQLSchema,
    Neo4J: Neo4JSchema
});

exports.Table = require('./table');
exports.MongoDBSchema = MongoDBSchema;
exports.MySQLSchema = MySQLSchema;
exports.Neo4JSchema = Neo4JSchema;
