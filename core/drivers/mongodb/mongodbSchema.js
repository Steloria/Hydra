const Schema = require('../schema');
const fs = require('fs');

module.exports = class MongoDBSchema extends Schema {
	isExportable() {return true}

	export(output) {
		if (!fs.existsSync(output)) {
			throw new Error('Output directory does not exist');
		}

		const tables = [];
		for (const k in this.tables) {
			tables.push({
				name: this.tables[k].name,
				body: this.buildTable(this.tables[k]),
			});
		}
		
		for (let i = 0; i < tables.length; i++) {
			fs.writeFileSync(output + '/' + tables[i].name.toLowerCase() + '.js', tables[i].body);
		}
	}

	buildTable({ name, fields }) {
		let body = `const mongoose = require('mongoose'); \n`;
		body += `const { Schema } = mongoose; \n\n`;
		body += `const schema = new Schema({ \n`;

		for (let k in fields) {
			const field = fields[k];
			body += `\t${field.name}: { type: ${this.getMongoType(field.type)}, required: ${field.isRequired}, unique: ${field.isUnique} }, \n`;
		}

		body += `}); \n\n`
		body += `module.exports = mongoose.model('${name}', schema); \n`;

		return body.trim();
	}

	getMongoType(type) {
		switch(type) {
			case Table.TYPE_STRING:
				return 'String';
			case Table.TYPE_INT:
				return 'Number';
			case Table.TYPE_FLOAT:
				return 'Number';
			case Table.TYPE_NUMBER:
				return 'Number';
			case Table.TYPE_BOOLEAN:
				return 'Boolean';
			case Table.TYPE_DATE:
				return 'Date';
			default:
				throw Error('Unsupported type');
		}
	}

	getAvailableAPI() {
		return {}
	}
};