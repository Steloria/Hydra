const MongoDBSchema = require('./mongodb/mongodbSchema');
const MySQLSchema = require('./mysql/mysqlSchema');

exports.getAvailableDrivers = () => ({
    MongoDB: MongoDBSchema,
    MySQL: MySQLSchema,
});

exports.Table = require('./table');
exports.MongoDBSchema = MongoDBSchema;
exports.MySQLSchema = MySQLSchema;
