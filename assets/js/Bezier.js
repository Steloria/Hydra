module.exports = class Bezier {
	getPos(from, to, h1, h2) {
		let x1 = from.pos.x;
        let y1 = from.pos.y;
        let x2 = to.pos.x;
        let y2 = to.pos.y;
        var bezier = "";

        if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) {
          if (x2 - x1 > 0) {
            bezier = `M${x1 + 250},${y1 + (h1 / 2)} Q${x1 + 280},${y1 + (h1 / 2)} ${(x2 - 30 + x1 + 280) / 2},${(y2 + (h2 / 2) + y1 + (h1 / 2)) / 2}T${x2},${y2 + (h2 / 2)}`;
            // Arrow L${x2 - 10},${y2 + (h2 / 2) - 7}M${x2},${y2 + (h2 / 2)}L${x2 - 10},${y2 + (h2 / 2) + 7}
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
	}

	getMidPos(from, to, h1, h2) {
		let x1 = from.pos.x;
        let y1 = from.pos.y;
        let x2 = to.pos.x;
        let y2 = to.pos.y;
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

        return {x, y};
	}
}