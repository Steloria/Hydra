var path = require('path');
var fs = require('fs');
let f = path.join(__dirname, 'assets/json/models.json');

window.onload = function() {
  var home = new Vue({
    el: '#home',
    created() {
      this.getModels()
    },
    data: {
      displayed: 'home',
      selectedTable: null,
      selectedConnexion: null,
      lineShown: null,
      loaded: null,
      showPopup: false,
      selectedModel: null,

      /* Model */
      models: [],
      model: {
        name: 'New Database',
        tables: [],
        connexions: [],
        scale: 1
      },

      /* Table */
      newTable: {
        id: '',
        name: "New Table",
        posX: 10,
        posY: 10,
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

      /* Connexion */
      newConnexion: {
        name: '',
        properties: [],
        from: '',
        to: '',
        type: ''
      },

      /* Drag & Drop */
      initialMouse: {
        x: 0,
        y: 0
      },
      initialItemPos: {
        x: 0,
        y: 0
      },
      movingItem: null,
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
        if (typeof this.$refs['conn' + i] == "undefined" || typeof this.$refs['conn' + i][0] == "undefined") return;

        let linkedTableFrom = this.findById(this.model.connexions[i].from);
        let linkedTableTo = this.findById(this.model.connexions[i].to);
        let x1 = linkedTableFrom.posX;
        let y1 = linkedTableFrom.posY;
        let x2 = linkedTableTo.posX;
        let y2 = linkedTableTo.posY;
        let h1 = this.$refs[linkedTableFrom.id][0].clientHeight;
        let h2 = this.$refs[linkedTableTo.id][0].clientHeight;
        var bezier = "";

        if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
          if (x2 - x1 > 0) {
            bezier = `M${x1 + 250},${y1 + (h1 / 2)} Q${x1 + 280},${y1 + (h1 / 2)} ${(x2 - 30 + x1 + 280) / 2},${(y2 + (h2 / 2) + y1 + (h1 / 2)) / 2}T${x2},${y2 + (h2 / 2)}`;
          } else {
            bezier = `M${x1},${y1 + (h1 / 2)} Q${x1 - 30},${y1 + (h1 / 2)} ${(x2 + 280 + x1 - 30) / 2},${(y2 + (h2 / 2) + y1 + (h1 / 2)) / 2} T${x2 + 250},${y2 + (h2 / 2)}`;
          }
        } else {
          if (y2 - y1 > 0) {
            bezier = `M${x1 + 125},${y1 + h1} Q${x1 + 125},${y1 + h1 + 20} ${(x2 + 125 + x1 + 125) / 2},${(y2 - 20 + y1 + h1 + 20) / 2} T${x2 + 125},${y2}`;
          } else {
            bezier = `M${x1 + 125},${y1} Q${x1 + 125},${y1 - 20} ${(x2 + 125 + x1 + 125) / 2},${(y2 - 20 + y1 + 20 + h2) / 2} T${x2 + 125},${y2 + h2}`;
          }
        }

        return bezier;
      },
      getMidPos: function(i, t, e) {
        if (typeof this.$refs['conn' + i] == "undefined" || typeof this.$refs['conn' + i][0] == "undefined") return;

        let linkedTableFrom = this.findById(this.model.connexions[i].from);
        let linkedTableTo = this.findById(this.model.connexions[i].to);
        let x1 = linkedTableFrom.posX;
        let y1 = linkedTableFrom.posY;
        let x2 = linkedTableTo.posX;
        let y2 = linkedTableTo.posY;
        let h1 = this.$refs[linkedTableFrom.id][0].clientHeight;
        let h2 = this.$refs[linkedTableTo.id][0].clientHeight;

        let x = 0;
        let y = 0;

        if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
          if (x2 - x1 > 0) {
            x = (x2 - 30 + x1 + 280) / 2;
            y = (y2 + (h2 / 2) + y1 + (h1 / 2)) / 2;
          } else {
            x = (x2 + 280 + x1 - 30) / 2;
            y = (y2 + (h2 / 2) + y1 + (h1 / 2)) / 2;
          }
        } else {
          if (y2 - y1 > 0) {
            x = (x2 + 125 + x1 + 125) / 2;
            y = (y2 - 20 + y1 + h1 + 20) / 2;
          } else {
            x = (x2 + 125 + x1 + 125) / 2;
            y = (y2 - 20 + y1 + 20 + h2) / 2;
          }
        }

        switch(t) {
          case 'x':
            return x - (this.$refs['conn' + i][0].clientWidth / 2);
            break;
          case 'y':
            return y - 12;
            break;
          default:
            break;
        }
      },
      isComplete: function(i) {
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
          this.initialItemPos.x = this.model.tables[pos].posX;
          this.initialItemPos.y = this.model.tables[pos].posY;
        }
        this.movingItem = pos;
      },
      moveItem: function(e) {
        if ((this.initialMouse.x == 0 && this.initialMouse.y == 0) || this.movingItem == null) {
          return
        }
        if (this.initialItemPos.x + ((e.screenX - this.initialMouse.x) * Math.abs(((this.model.scale - 1) * -1) + 1)) > 0) this.model.tables[this.movingItem].posX = this.initialItemPos.x + ((e.screenX - this.initialMouse.x) * Math.abs(((this.model.scale - 1) * -1) + 1));
        if (this.initialItemPos.y + ((e.screenY - this.initialMouse.y) * Math.abs(((this.model.scale - 1) * -1) + 1)) > 0) this.model.tables[this.movingItem].posY = this.initialItemPos.y + ((e.screenY - this.initialMouse.y) * Math.abs(((this.model.scale - 1) * -1) + 1));
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
            if (this.model.scale > 0.8) this.model.scale -= 0.1;
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
      },
      saveModel: function() {
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
    }
  })
}