const fs = require('fs');
var beautify = require('js-beautify').js
var path = require('path');

module.exports = class Neo4JNodeApi {
	export(output, schema) {
		if (!fs.existsSync(output)) {
			throw new Error('Output directory does not exist');
		}

		// Try to create the folders. If it already exists, nevermind.
		try {fs.mkdirSync(`${output}/src`)} catch {}
		try {fs.mkdirSync(`${output}/src/routes`)} catch {}

		fs.copyFile(path.join(__dirname, 'files/package.json'), `${output}/package.json`, (err) => {
		   if (err) throw new Error(err);
		});
		fs.copyFile(path.join(__dirname, './files/app.js'), `${output}/src/app.js`, (err) => {
		   if (err) throw new Error(err);
		});

		var req = "";
		var func = "";
		for (const k in schema.tables) {
			const name = schema.tables[k].name;
			req += `const ${name} = require('./${name}_routes');\n`;
			func += `\t${name}(app, db);\n`;
			this.buildTable(schema.tables[k], output);
		}

		const body = `${req}\n module.exports = function(app, db) {\n ${func}};`;
		fs.writeFileSync(`${output}/src/routes/index.js`, beautify(body));
	}

	buildTable({ name, fields, relationships }, output) {
		let body = `var neo4j = require("neo4j-driver").v1;\n\nmodule.exports = function(app, db) {\n`;

		body += this.buildPost(name, fields);
		body += this.buildGet(name, fields);
		body += this.buildGetById(name, fields);
		body += this.buildPatch(name, fields);
		body += this.buildDelete(name, fields);

		for (const k of Object.keys(relationships)) {
			body += this.buildRelationPost(name, relationships[k].name, relationships[k].table.name, relationships[k].table.fields);
			body += this.buildRelationGet(name, relationships[k].name, relationships[k].table.name, relationships[k].table.fields);
		}

		body = body.trim();
		body = body.substr(0, body.length - 1);
		body += `\n`;
		body += `} \n\n`;

		fs.writeFileSync(`${output}/src/routes/${name}_routes.js`, beautify(body));
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
		let body = `app.get('/${name.toLowerCase()}/:entity_id', (req, res) => {\nconst entity_id = req.params.entity_id;\n`;

		body += `db.run('MATCH (n:${name}) WHERE ID(n) = {entity_id} RETURN n', {entity_id: neo4j.int(entity_id)})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}

	buildPatch(name, fields) {
		let body = `app.patch('/${name.toLowerCase()}/:entity_id', (req, res) => {\nconst entity_id = req.params.entity_id;\n`;
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

		params += "entity_id: neo4j.int(entity_id)"
		body += `db.run('MATCH (n:${name}) WHERE ID(n) = {entity_id} SET n = {${nodeParams.slice(0, -2)}} RETURN n', {${params}})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}

	buildDelete(name, fields) {
		let body = `app.delete('/${name.toLowerCase()}/:entity_id', (req, res) => {\nconst entity_id = req.params.entity_id;\n`;

		body += `db.run('MATCH (n:${name}) WHERE ID(n) = {entity_id} DETACH DELETE n', {entity_id: neo4j.int(entity_id)})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}

	buildRelationPost(from, label, name, fields) {
		let body = `app.post('/${from}/:entity_id/${name.toLowerCase()}', (req, res) => {\nconst entity_id = req.params.entity_id;\n`;
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

		params += "entity_id: neo4j.int(entity_id)"
		body += `db.run('MATCH (e) WHERE ID(e) = {entity_id} CREATE (e)-[:${label}]->(n:${name} {${nodeParams.slice(0, -2)}}) RETURN n', {${params}})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}
	buildRelationGet(from, label, name, fields) {
		let body = `app.get('/${from}/:entity_id/${name.toLowerCase()}', (req, res) => {\nconst entity_id = req.params.entity_id;\n`;

		body += `db.run('MATCH (n:${from})-[:${label}]->(e:${name}) WHERE ID(n) = {entity_id} RETURN e', {entity_id: neo4j.int(entity_id)})\n.then((result) => {res.send(result);})\n.catch((err) => console.log(err));\n});`;
		return body;
	}
};