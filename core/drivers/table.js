module.exports = class Table {

    static get TYPE_STRING() { return 'String'; }
    static get TYPE_NUMBER() { return 'Number'; }
    static get TYPE_INT() { return 'Int'; }
    static get TYPE_FLOAT() { return 'Float'; }
    static get TYPE_BOOLEAN() { return 'Boolean'; }
    static get TYPE_DATE() { return 'Date'; }

    static get HAS_ONE() { return 'HasOne'; }
    static get HAS_MANY() { return 'HasMany'; }

    constructor(name) {
        if (!name) {
            throw new Error('Table name is required');
        }

        this.id = Math.random().toString(32).substr(2);
        this.name = name;
        this.fields = {};
        this.relationships = {};
    }

    setField(name, type, isRequired = false, isUnique = false, defaultValue = null, length = null) {
        if (!name) {
            throw new Error('Field name is required');
        }

        if (this.fields[name] || this.relationships[name]) {
            throw new Error('A field with the name ' + name + ' is already set');
        }

        if (![Table.TYPE_STRING, Table.TYPE_NUMBER, Table.TYPE_BOOLEAN, Table.TYPE_DATE, Table.TYPE_INT, Table.TYPE_FLOAT].includes(type)) {
            console.log(type);
            throw new Error(`Type must be part of ${Table.TYPE_STRING}, ${Table.TYPE_NUMBER}, ${Table.TYPE_DATE}, ${Table.TYPE_INT}, ${Table.TYPE_FLOAT} or ${Table.TYPE_BOOLEAN}`);
        }

        this.fields[name] = { 
            name, 
            type, 
            isRequired, 
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

        delete this.fields[name];

        return this;
    }

    addRelationship(name, type, table) {
        if (!(table instanceof Table)) {
            throw new Error('Table must be instance of Table');
        }

        if (this.fields[name] || this.relationships[name]) {
            throw new Error('A field with the name ' + name + ' is already set');
        }

        if (![Table.HAS_MANY, Table.HAS_ONE].includes(type)) {
            throw new Error(`Type must be part of ${Table.HAS_MANY} or ${Table.HAS_ONE}`);
        }

        this.relationships[name] = {
            name,
            type,
            table
        };

        return this;
    }

    deleteRelationship(name) {
        if (!this.relationships[name]) {
            throw new Error('Relationship ' + name + ' not found');
        }

        delete this.relationships[name];

        return this;
    }

};