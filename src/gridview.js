// A generic view of a given grid object.
// - onclick - Fired when the user clicks on a grid cell. Returns the x,y 
//             position in grid coordinates.
// - onhover - Fired when the user hovers over a new grid cell. Is either null
//             if there isn't a currently hovered cell, or the x-y coordinates
//             of that cell.
class GridView {
  constructor(parentElement) {
    // The last focused grid element.
    this.lastFocus = null;

    this.onclick = (_pos) => {
    };

    this.onhover = (_pos) => {
    };

    // The container for all the grid's rows and cells.
    this.gridItem = elementBuild("div", {
      id: "tttgrid",
      parent: parentElement,
    });

    this.gridItem.addEventListener("click", (evt) => {
      if (!evt.target.classList.contains("tttcell")) { return; }

      this.onclick({ 
        x: Number(evt.target.dataset.x),
        y: Number(evt.target.dataset.y),
      });
    });

    this.gridItem.addEventListener("mouseover", (evt) => {
      let newFocus = null;

      if (evt.target.classList.contains("tttcell")) {
        newFocus = {
          x: Number(evt.target.dataset.x),
          y: Number(evt.target.dataset.y),
        };
      }

      const oneIsNull =
        this.lastFocus === null && newFocus !== null ||
        this.lastFocus !== null && newFocus === null;
      const bothNonNull =
        this.lastFocus !== null && newFocus !== null;
      const differentValues =
        bothNonNull && (this.lastFocus.x !== newFocus.x ||
          this.lastFocus.y !== newFocus.y);
      if (oneIsNull || differentValues) {
        this.lastFocus = newFocus;
        this.onhover(newFocus);
      }
    });
  }

  // Rebuilds the grid in the DOM. The provided buildFn will be passed
  // the x, y, and current cell (as an object containing the cell and hbox)
  // to initialize the object.
  buildNewGrid(width, height, buildFn = null) {
    let newFun = (_x, _y, _cell) => {};

    if (buildFn !== null) {
      newFun = buildFn;
    }

    this.gridItem.textContent = "";
    this.renderableGrid = 
      new Grid(width, height,
        (x, y) => {
          let cell = elementBuild("div", {
            classList: "tttcell",
          });

          let cellHoverBox = elementBuild("div", {
            classList: "cellhoverbox",
            parent: cell,
          });

          cell.dataset.x = x;
          cell.dataset.y = y;

          let obj = {
            cell: cell,
            hbox: cellHoverBox,
          };

          newFun(x, y, obj);

          return obj;
        });

    for (let y = 0; y < height; y++) {
      let row = elementBuild("div", {
        classList: "tttrow",
        parent: this.gridItem,
      });
      for (let x = 0; x < width; x++) {
        let cell = this.renderableGrid.get(x, y);
        row.appendChild(cell.cell);
      }
    }
  }

  update(x, y, newClasses) {
    let cell = this.renderableGrid.get(x, y);
    cell.cell.className = "tttcell";
    let trimmed = newClasses.trim();
    if (trimmed.length !== 0) {
      for (const c of trimmed.split(" ")) {
        cell.cell.classList.add(c);
      }
    }
  }

  getCell(x, y) {
    return this.renderableGrid.get(x, y).cell;
  }

  getHbox(x, y) {
    return this.renderableGrid.get(x, y).hbox;
  }

  animate(x, y, animationName, params = {}) {
    applyAnimation(this.renderableGrid.get(x, y).cell, animationName, params);
  }
}
