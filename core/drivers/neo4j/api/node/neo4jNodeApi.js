const Schema = require('../../../schema');
const fs = require('fs');
var beautify = require('js-beautify').js
var mkdirp = require('mkdirp');
var path = require('path');

module.exports = class Neo4JNodeApi extends Schema {
	export(output) {
		if (!fs.existsSync(output)) {
			throw new Error('Output directory does not exist');
		}

		fs.mkdirSync(output + '/src');
		fs.mkdirSync(output + '/src/routes');
		fs.copyFile(path.join(__dirname, 'files/package.json'), output + '/package.json', (err) => {
		   if (err) throw new Error(err);
		});
		fs.copyFile(path.join(__dirname, './files/app.js'), output + '/src/app.js', (err) => {
		   if (err) throw new Error(err);
		});

		var req = "";
		var func = "";
		for (const k in this.tables) {
			const name = this.tables[k].name;
			req += `const ${name} = require('./${name}_routes');\n`;
			func += `\t${name}(app, db);\n`;
			this.buildTable(this.tables[k], output);
		}

		const body = `${req}\n module.exports = function(app, db) {\n ${func}};`;
		fs.writeFileSync(output + '/src/routes/index.js', beautify(body));
	}

	buildTable({ name, fields }, output) {
		let body = `var neo4j = require("neo4j-driver").v1;\n\nmodule.exports = function(app, db) {\n`;

		body += this.buildPost(name, fields);
		body += this.buildGet(name, fields);
		body += this.buildGetById(name, fields);
		body += this.buildPatch(name, fields);
		body += this.buildDelete(name, fields);
		body = body.trim();
		body = body.substr(0, body.length - 1);
		body += `\n`;
		body += `} \n\n`;

		fs.writeFileSync(output + '/src/routes/' + `${name}_routes.js`, beautify(body));
	}

	buildPost(name, fields) {
		let body = `app.post('/${name.toLowerCase()}', (req, res) => {\n`;
		let nodeParams = "";
		let params = "";

		for (let k in fields) {
			const field = fields[k];
			if (field.isRequired) {
				body += `if (!req.body.${field.name}) \nreturn res.json({success: false, msg: '${field.name} missing.'});`;
			}
			nodeParams += `${field.name}: {${field.name}}, `;
			params += `${field.name}: req.body.${field.name}, `;
		}
		body += `db.run('CREATE (n:${name} {${nodeParams.slice(0, -2)}}) RETURN n', {${params}})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}

	buildGet(name, fields) {
		let body = `app.get('/${name.toLowerCase()}', (req, res) => {\n`;

		body += `db.run('MATCH (n:${name}) RETURN n')\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}

	buildGetById(name, fields) {
		let body = `app.get('/${name.toLowerCase()}/:id', (req, res) => {\nconst id = req.params.id;\n`;

		body += `db.run('MATCH (n:${name}) WHERE ID(n) = {id} RETURN n', {id: neo4j.int(id)})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}

	buildPatch(name, fields) {
		let body = `app.patch('/${name.toLowerCase()}/:id', (req, res) => {\nconst id = req.params.id;\n`;
		let nodeParams = "";
		let params = "";

		for (let k in fields) {
			const field = fields[k];
			if (field.name != "id") {
				if (field.isRequired) {
					body += `if (!req.body.${field.name}) \nreturn res.json({success: false, msg: '${field.name} missing.'});`;
				}
				nodeParams += `${field.name}: {${field.name}}, `;
				params += `${field.name}: req.body.${field.name}, `;
			}
		}

		params += "id: id"
		body += `db.run('MATCH (n:${name}) WHERE ID(n) = {id} SET n = {${nodeParams.slice(0, -2)}} RETURN n', {${params}})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}

	buildDelete(name, fields) {
		let body = `app.delete('/${name.toLowerCase()}/:id', (req, res) => {\nconst id = req.params.id;\n`;

		body += `db.run('MATCH (n:${name}) WHERE ID(n) = {id} DETACH DELETE n', {id: neo4j.int(id)})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}
};