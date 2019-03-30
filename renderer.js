var path = require('path');
var fs = require('fs');
let f = path.join(__dirname, 'assets/json/models.json');
var drivers = require(path.join(__dirname, 'core/drivers/index.js'));
var Bezier = require(path.join(__dirname, 'assets/js/Bezier'));

window.onload = function() {
  var home = new Vue({
    el: '#home',
    created() {
      this.getModels();
      this.available = drivers.getAvailableDrivers();
    },
    watch: {},
    data: {
      displayed: 'home',
      selectedTable: null,
      selectedConnexion: null,
      lineShown: null,
      loaded: null,
      showPopup: false,
      selectedModel: null,

      /* Export */
      available: null,
      exporter: {
        show: false,
        db: "",
        folder: "",
        availableApi: {},
        options: [],
        api: ""
      },

      /* Model */
      models: [],
      model: {
        name: 'New Database',
        tables: [],
        connexions: [],
        scale: 1
      },

      newTable: {
        id: '',
        name: "New Table",
        pos: {x: 10, y: 10},
        properties: [
          {
            name: 'id',
            type: 'Int',
            unique: 'true',
            required: 'true',
            size: '',
            default: ''
          }
        ],
      },

      newConnexion: {
          name: '',
          properties: [],
          from: '',
          to: '',
          type: ''
      },

      /* Drag & Drop */
      initialMouse: {x: 0, y: 0},
      initialItemPos: {x: 0, y: 0},
      containerPos: {x: 0, y: 0},
      movingItem: null,
      isContainerMoving: false
    },
    methods: {
      /* Tables */
      addTable: function() {
        this.model.tables.push(this.duplicate(this.newTable));
        this.selectedTable = this.model.tables.length - 1;
        this.model.tables[this.selectedTable].id = this.makeid();
        this.selectedConnexion = null;
      },
      removeTable: function(i) {
        this.model.tables.splice(this.selectedTable, 1);
        this.selectedTable = null;
      },
      findById(id) {
        for (const i of this.model.tables) {
          if (i.id == id) return i;
        }
      },

      /* Tables Properties */
      addLine: function() {
        this.model.tables[this.selectedTable].properties.push({
            name: 'New Line',
            type: 'Int',
            unique: 'false',
            required: 'true',
            size: '',
            default: ''
          });
        this.lineShown = this.model.tables[this.selectedTable].properties.length - 1;
      },
      showLine: function(i) {
        this.lineShown = this.lineShown != i ? i : null;
      },
      removeLine: function(i) {
        this.model.tables[this.selectedTable].properties.splice(i, 1);
        this.lineShown = null;
      },

      /* Connexions */
      addConnexion: function() {
        this.model.connexions.push(this.duplicate(this.newConnexion));
        this.selectedConnexion = this.model.connexions.length - 1;
        this.selectedTable = null;
      },
      removeConnexion: function(i) {
        this.model.connexions.splice(i, 1);
        this.selectedConnexion = null;
      },
      getPos: function(i) {
        let linkedTableFrom = this.findById(this.model.connexions[i].from);
        let linkedTableTo = this.findById(this.model.connexions[i].to);
        if (!this.$refs[linkedTableFrom.id] || !this.$refs[linkedTableTo.id] || this.$refs[linkedTableFrom.id].length < 1) return;
        let h1 = this.$refs[linkedTableFrom.id][0].clientHeight;
        let h2 = this.$refs[linkedTableTo.id][0].clientHeight;
        
        let b = new Bezier();
        return b.getPos(linkedTableFrom, linkedTableTo, h1, h2);
      },
      getMidPos: function(i, t) {
        if (typeof this.$refs['conn' + i] == "undefined" || typeof this.$refs['conn' + i][0] == "undefined") return;
        let linkedTableFrom = this.findById(this.model.connexions[i].from);
        let linkedTableTo = this.findById(this.model.connexions[i].to);
        let h1 = this.$refs[linkedTableFrom.id][0].clientHeight;
        let h2 = this.$refs[linkedTableTo.id][0].clientHeight;

        let b = new Bezier();
        let {x, y} = b.getMidPos(linkedTableFrom, linkedTableTo, h1, h2);
        return t == 'x' ? x - (this.$refs['conn' + i][0].clientWidth / 2) : y - 12;
      },
      isComplete: function(i, type) {
        if (this.model.connexions[i].from != '' && this.model.connexions[i].to != '') {
          return true;
        } else {
          return false;
        }
      },
      addProperty: function() {
        this.model.connexions[this.selectedConnexion].properties.push({
            name: 'New Property'
          });
      },
      removeProperty: function(i) {
        this.model.connexions[this.selectedConnexion].properties.splice(i, 1);
      },

      /* Drag & Drop */
      startMovingItem: function(e, pos) {
        if (this.initialMouse.x == 0 && this.initialMouse.y == 0) {
          this.initialMouse.x = e.screenX;
          this.initialMouse.y = e.screenY;
          this.initialItemPos.x = this.model.tables[pos].pos.x;
          this.initialItemPos.y = this.model.tables[pos].pos.y;
        }
        this.movingItem = pos;
        this.isContainerMoving = false;
      },
      startMovingContainer: function(e) {
        if (this.initialMouse.x == 0 && this.initialMouse.y == 0 && this.movingItem == null) {
          this.initialMouse.x = e.screenX;
          this.initialMouse.y = e.screenY;
          this.initialItemPos.x = this.containerPos.x;
          this.initialItemPos.y = this.containerPos.y;
          this.isContainerMoving = true;
        }
      },
      moveItem: function(e) {
        if ((this.initialMouse.x == 0 && this.initialMouse.y == 0) || (this.movingItem == null && this.isContainerMoving == false)) {
          return
        }
        if (this.isContainerMoving) {
          this.containerPos.x = this.initialItemPos.x + ((e.screenX - this.initialMouse.x));
          this.containerPos.y = this.initialItemPos.y + ((e.screenY - this.initialMouse.y));
        } else {
          if (this.initialItemPos.x + ((e.screenX - this.initialMouse.x) * Math.abs(((this.model.scale - 1) * -1) + 1)) > 0) this.model.tables[this.movingItem].pos.x = this.initialItemPos.x + ((e.screenX - this.initialMouse.x) * Math.abs(((this.model.scale - 1) * -1) + 1));
          if (this.initialItemPos.y + ((e.screenY - this.initialMouse.y) * Math.abs(((this.model.scale - 1) * -1) + 1)) > 0) this.model.tables[this.movingItem].pos.y = this.initialItemPos.y + ((e.screenY - this.initialMouse.y) * Math.abs(((this.model.scale - 1) * -1) + 1));
        }
      },
      stopMovingItem: function() {
        this.initialMouse.x = 0;
        this.initialMouse.y = 0;
        this.initialItemPos.x = 0;
        this.initialItemPos.y = 0;
        this.movingItem = null;
      },

      /* Scale */
      scaleContainer: function() {
        return `scale(${this.model.scale})`;
      },
      changeScale: function(type) {
        switch (type) {
          case "+":
            if (this.model.scale < 1.3) this.model.scale += 0.1;
            break;
          case "-":
            if (this.model.scale > 0.7) this.model.scale -= 0.1;
            break;
          default:
            break;
        }
      },

      newModel: function() {
        if (this.model.name != 'New Database' || this.model.tables.length > 0) {
          if (!confirm("You were already editing an unsaved model, do you want to create a new one ?")) return;
        }
        this.reset();
        this.displayed = "create";
      },
      loadModel: function(i) {
        if (this.model.name != 'New Database' || this.model.tables.length > 0) {
          if (!confirm("You were already editing an unsaved model, do you want to load this one ?")) return;
        }
        this.getModels();
        this.reset();
        this.model = this.models[i];
        this.displayed = "create";
        this.loaded = i;
        this.activateDisplayWithDelay();
        var s = (this.model.scale - 1) * 1000;
        this.containerPos = {x: s, y: s};
      },
      saveModel: function() {
        //remove unfilled connexions
        for (var i = 0; i < this.model.connexions.length; i++) {
          let conn = this.model.connexions[i];
          if (conn.from == "" || conn.to == "") {
            this.model.connexions.splice(i, 1);
            i--;
          } 
        }

        if (this.loaded == null) {
          this.models.push(this.model);
        } else {
          this.models[this.loaded] = this.model;
        }
        this.saveModels();
        alert("Model successfully saved");
        this.displayed = "home";
        this.reset();
      },
      deleteModel: function(i) {
        if (!confirm("This action can't be undone, are you sure ?")) return;
        this.showPopup = false;
        this.selectedModel = null;
        if (this.model.loaded == i) this.model.loaded = null;
        this.models.splice(i, 1);
        this.saveModels();
      },
      getModels: function() {
        let fun = this.loadModels;
        fs.readFile(f, 'utf8', function (err,data) {
          if (err) return console.log(err);
          fun(JSON.parse(data));
        });
      },
      saveModels: function() {
        fs.writeFile(f, JSON.stringify(this.models), function(err) {
          if (err) {
            console.log(err);
          }
        });
      },
      loadModels: function(data) {
        this.models = data;
      },
      reset: function() {
        this.model = {
          scale: 1,
          name: 'New Database',
          tables: [],
          connexions: []
        };
        this.selectedTable = null;
        this.selectedConnexion = null;
        this.lineShown = null;
        this.loaded = null;
        this.containerPos = {x: 0, y: 0};
      },

      /* Export */
      getAvailableApi(key) {
        this.exporter.api = "";
        this.exporter.db = key;
        let db = new this.available[this.exporter.db]("empty");
        this.exporter.availableApi = db.getAvailableAPI();
      },
      isExportable() {
        let db = new this.available[this.exporter.db]("empty");
        return db.isExportable();
      },
      exportDb(obj) {
        let db = this.buildSchema();
        //console.log(db.export("/Users/medrupaloscil/Desktop/bdd"));
      },
      exportApi(obj) {
        let api = new obj();
        api.export("/Users/medrupaloscil/Desktop/test", this.buildSchema());
      },
      buildSchema() {
        let db = new this.available[this.exporter.db](this.models[this.selectedModel].name.toLowerCase());
        for (const i of this.models[this.selectedModel].tables) {
          let table = new drivers.Table(i.name.toLowerCase(), i.id);
          for (const j of i.properties) {
            table.setField(j.name.toLowerCase(), j.type, j.required, j.unique, j.default, j.length);
          }
          for (const i of this.models[this.selectedModel].connexions) {

          }
          db.setTable(table);
        }
        for (const i of this.models[this.selectedModel].connexions) {
          if (i.from != "" && i.to != "") {
            let from = this.findTableNameFromId(db, i.from);
            let to = this.findTableNameFromId(db, i.to);
            db.tables[from].addRelationship(i.name, i.type, db.tables[to]);
          }
        }

        return db;
      },
      

      /* Useful Functions */
      makeid: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 30; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
      },
      duplicate: function(elem) {
        return JSON.parse(JSON.stringify(elem));
      },
      /* Useful to display relations properly */
      activateDisplayWithDelay: function() {
        var f = this.activateDisplay;
        setTimeout(function() {
          f();
        }, 10);
      },
      activateDisplay: function() {
        var name = this.model.name;
        this.model.name += " ";
        this.model.name = name;
      },
      findTableNameFromId: function(db, id) {
        for (const i of Object.keys(db.tables)) {
          if (db.tables[i].id == id) {
            return db.tables[i].name;
          }
        }
      }
    }
  })
}