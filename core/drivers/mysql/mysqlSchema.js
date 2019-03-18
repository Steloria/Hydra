const Schema = require('../schema');
const Table = require('../table');
const fs = require('fs');

module.exports = class MySQLSchema extends Schema {
	isExportable() {return true}

	export(output) {
		if (!fs.existsSync(output)) {
			throw new Error('Output directory does not exist');
		}

		let file = `CREATE DATABASE ${this.name};\nUSE ${this.name}; \n\n`;

		for (const k in this.tables) {
			file += this.buildTable(this.tables[k]);
		}

		fs.writeFileSync(output + '/schema.sql', file);
	}

	buildTable({ name, fields }) {
		let body = `CREATE TABLE ${name.toLowerCase()} ( \n`;

		for (let k in fields) {
			const field = fields[k];
			body += `\t${field.name} ${this.getSQLType(field.type)},\n`;
		}
		
		body = body.trim();
		body = body.substr(0, body.length - 1);
		body += `\n`;
		
		body += `); \n\n`;

		return body;
	}

	getSQLType(type) {
		switch(type) {
			case Table.TYPE_STRING:
				return 'varchar(255)';
			case Table.TYPE_INT:
				return 'integer';
			case Table.TYPE_FLOAT:
				return 'float';
			case Table.TYPE_NUMBER:
				return 'double';
			case Table.TYPE_BOOLEAN:
				return 'tinyint(1)';
			case Table.TYPE_DATE:
				return 'datetime';
			default:
				throw Error('Unsupported type');
		}
	}

	getAvailableAPI() {
		return {}
	}
};