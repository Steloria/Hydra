const Table = require('./table')

module.exports = class Schema {

    constructor(name) {
        if (!name) {
            throw new Error('Schema name is required');
        }

        this.name = name;
        this.tables = {};
    }

    setTable(table) {
        if (!(table instanceof Table)) {
            throw new Error('Table must be instance of Table');
        }

        if (this.tables[table.name]) {
            throw new Error('Table with name ' + name + ' already exist');
        }

        this.tables[table.name] = table;

        return this;
    }

    deleteTable(table) {
        if (!(table instanceof Table)) {
            throw new Error('Table must be instance of Table');
        }

        if (!this.tables[table.name]) {
            throw new Error('Table with name ' + name + ' not exist');
        }

        delete this.tables[table.name];

        return this;
    }

};