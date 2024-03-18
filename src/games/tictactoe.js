class TeeThreeEngine {
  constructor(rules) {
    this.width = rules.width
    this.height = rules.height
    this.toWin = rules.toWin
    this.name = 'teethree'

    this.reset()
  }

  // Resets all game parameters.
  reset() {
    this.grid = new Grid(this.width, this.height)
    this.turn = 1
    this.outcome = null
  }

  update(action) {
    switch(action.name) {
      case 'move':
        this.makeMove(action.x, action.y)
        break;
    }
  }

  // Check for all possible wins and return the first win.
  checkWin(player) {
    let wins = this.grid.allKInARows(this.toWin, player)
    return (wins.length !== 0)
    ? {
      player: this.turn,
      tiles: wins[0],
    }
    : null
  }
  

  makeMove(x, y) {
    if (this.grid.get(x, y) !== null || this.outcome !== null) { return }
    
    this.grid.set(x, y, this.turn)
    
    const win = this.checkWin(this.turn);
    if (win !== null) {
      this.outcome = win
    } else if (this.grid.grid.every((elem) => elem !== null)) {
      this.outcome = {
        player: 0,
        tiles: []
      }
    } else {
      this.turn *= -1;
    }
  }

  buildView(domElems) {
    return new TeeThreeView(domElems, this)
  }
}

class TeeThreeView {
  constructor(domElems, engine) {
    this.rootElement = domElems.root
    this.gameContainer = domElems.container
    this.status = domElems.status

    // Build grid
    this.gridItem = document.createElement('div')
    this.gridItem.id = 'tttgrid'
    this.gameContainer.appendChild(this.gridItem)
    this.gridItem.addEventListener('click', (evt) => {
      const target = evt.target
      if (!target.classList.contains('tttcell')) { return }
      const coordinates = target.id.split(' ').map((s) => Number(s))
      if (coordinates.length < 2 ||
        coordinates.some((c) => 
          c === undefined || c === NaN
        )
      ) {
        console.log('Invalid cell ID')
        return
      }

      this.sendAction({
        name: 'move',
        x: coordinates[0],
        y: coordinates[1]
      })
    })

    this.rebuildGrid(engine)
  }

  rebuildGrid(engine) {
    this.gridItem.innerHTML = '';
    this.renderableGrid = new Grid(engine.grid.width, engine.grid.height)
    for (let y = 0; y < engine.grid.height; y++) {
      let row = document.createElement('div')
      row.classList.add('tttrow')
      for (let x = 0; x < engine.grid.width; x++) {
        let cell = document.createElement('div')
        cell.classList.add('tttcell')
        let entry = engine.grid.get(x, y)
        if (entry === 1) { cell.classList.add('red') }
        else if (entry === -1) { cell.classList.add('blue') }
        cell.id = `${x} ${y}`

        row.appendChild(cell)
        this.renderableGrid.set(x, y, cell);
      }
      this.gridItem.appendChild(row)
    }

    this.lastWidth = engine.grid.width
    this.lastHeight = engine.grid.height

    // Set transform to scale inner contents to 600px
    const maxLen = Math.max(
        this.gameContainer.clientWidth,
        this.gameContainer.clientHeight,
    )
    // this.scaleWindow(600/maxLen)
  }

  // Updates the view with the current game state.
  render(engine) {
    if (engine.grid.width !== this.lastWidth ||
        engine.grid.height !== this.lastHeight) {
      this.rebuildGrid(engine)
    }
    for (let y = 0; y < engine.grid.height; y++) {
      for (let x = 0; x < engine.grid.width; x++) {
        let cell = this.renderableGrid.get(x, y)
        cell.className = 'tttcell'
        const entry = engine.grid.get(x, y)

        const winPrefix =
          (engine.outcome &&
           engine.outcome.tiles.some((p) => 
            p.x === x && p.y === y  
           ))
          ? 'win-'
          : ''
        if (entry === 1) { 
          cell.classList.add(`${winPrefix}red`, 'filledcell')
        }
        else if (entry === -1) {
          cell.classList.add(`${winPrefix}blue`, 'filledcell')
        }
        else if (!this.outcome) { cell.classList.add('hoverable') }
      }
    }

    let hover = ''
    if (engine.outcome && engine.outcome.player !== undefined) {
      hover = 'var(--background-color)'
    } else if (engine.turn === 1) {
      hover = 'var(--player1-color)'
    } else {
      hover = 'var(--player2-color)'
    }
    this.rootElement.style.setProperty('--hover-color', hover)
    
    this.renderStatus(engine)
  }
  
  // Renders the current game status line beneath the grid.
  renderStatus(engine) {
    if (engine.outcome === null) {
      this.status.innerHTML =
        `${this.inlineIndicator(engine.turn)} TO MOVE`
      this.status.className = ''
    } else {
      if (engine.outcome.player === 0) {
        this.status.innerHTML = 'TIE'
        this.status.className = 'tie'
      } else {
        this.status.innerHTML =
          `${this.inlineIndicator(engine.outcome.player)} WIN`
        const colorTag =
          (engine.outcome.player === 1)
          ? 'red'
          : 'blue'
        this.status.className = `win-${colorTag}`
      }
    }
  }

  inlineIndicator(color) {
    if (color === 1) {
      return '<i class=\'red fa-solid fa-x\'></i>'
    } else {
      return '<i class=\'blue fa-solid fa-o\'></i>'
    }
  }
}
