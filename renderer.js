window.onload = function() {
  var home = new Vue({
    el: '#home',
    created() {
      this.models = JSON.parse(localStorage.getItem("models"));
      if (this.models == null) this.models = [];
    },
    data: {
      displayed: 'home',
      selectedTable: null,
      selectedConnexion: null,
      lineShown: null,

      /* Model */
      models: [],
      model: {
        name: 'New Database',
        tables: [],
        connexions: []
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
        name: 'CONNECTED_TO',
        properties: [],
        from: '',
        to: ''
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
      getPos: function(type, i) {
        switch (type) {
          case "x1":
            console.log(this.model.connexions[i].from);
            var linkedTable = this.findById(this.model.connexions[i].from);
            return linkedTable.posX + 250;
            break;
          case "x2":
            var linkedTable = this.findById(this.model.connexions[i].to);
            return linkedTable.posX;
            break;
          case "y1":
            var linkedTable = this.findById(this.model.connexions[i].from);
            return linkedTable.posY + 20;
            break;
          case "y2":
            var linkedTable = this.findById(this.model.connexions[i].to);
            return linkedTable.posY + 20;
            break;
          default:
            break;
        }
        return 0;
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
        this.model.tables[this.movingItem].posX = this.initialItemPos.x + (e.screenX - this.initialMouse.x);
        this.model.tables[this.movingItem].posY = this.initialItemPos.y + (e.screenY - this.initialMouse.y);
      },
      stopMovingItem: function() {
        this.initialMouse.x = 0;
        this.initialMouse.y = 0;
        this.initialItemPos.x = 0;
        this.initialItemPos.y = 0;
        this.movingItem = null;
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
    }
  })
}