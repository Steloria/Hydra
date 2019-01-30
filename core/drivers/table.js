module.exports = class Table {

    static get TYPE_STRING() { return 'String'; }
    static get TYPE_NUMBER() { return 'Number'; }
    static get TYPE_BOOLEAN() { return 'Boolean'; }
    static get TYPE_DATE() { return 'Date'; }

    constructor(name) {
        if (!name) {
            throw new Error('Table name is required');
        }

        this.id = Math.random().toString(32).substr(2);
        this.name = name;
        this.fields = {};
    }

    setField(name, type, isRequire = false, isUnique = false, defaultValue = null, length = null) {
        if (!name) {
            throw new Error('Field name is required');
        }

        if (this.fields[name]) {
            throw new Error('A field with the name ' + name + ' is already set');
        }

        if (![Table.TYPE_STRING, Table.TYPE_NUMBER, Table.TYPE_BOOLEAN, Table.TYPE_DATE].includes(type)) {
            throw new Error(`Type must be part of ${Table.TYPE_STRING}, ${Table.TYPE_NUMBER}, ${Table.TYPE_DATE} or ${Table.TYPE_BOOLEAN}`);
        }

        this.fields[name] = { 
            name, 
            type, 
            isRequire, 
            isUnique, 
            defaultValue,
            length
        };

        return this;
    }
    
    deleteField(name) {
        if (!this.fields[name]) {
            throw new Error('Field ' + name + ' not found');
        }

        delete this.fields[name]

        return this;
    }

};