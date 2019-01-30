window.onload = function() {
  var home = new Vue({
    el: '#home',
    created() {
      this.models = JSON.parse(localStorage.getItem("models"));
      if (this.models == null) this.models = [];
    },
    data: {
      displayed: 'home',
      models: [],
      model: {
        name: 'New Database',
        tables: [],
        connexions: []
      },
      selectedTable: null,
      initialMouse: {
        x: 0,
        y: 0
      },
      initialItemPos: {
        x: 0,
        y: 0
      },
      movingItem: null,
      newTable: {
        id: '',
        posX: 10,
        posY: 10,
        lines: [
          {
            'name': 'id',
            'type': 'Int',
            'unique': 'true',
            'required': 'true',
            'size': '',
            'default': ''
          }
        ],
        name: "New Table"
      },
      lineShown: null
    },
    methods: {
      addTable: function() {
        this.model.tables.push(this.duplicate(this.newTable));
        this.selectedTable = this.model.tables.length - 1;
      },
      addLine: function() {
        this.model.tables[this.selectedTable].lines.push({
            'name': 'New Line',
            'type': 'Int',
            'unique': 'false',
            'required': 'true',
            'size': '',
            'default': ''
          });
      },
      duplicate: function(elem) {
        return JSON.parse(JSON.stringify(elem));
      },
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
      showLine: function(i) {
        this.lineShown = this.lineShown != i ? i : null;
      },
      removeLine: function(i) {
        this.model.tables[this.selectedTable].lines.splice(i, 1);
      }
    }
  })
}