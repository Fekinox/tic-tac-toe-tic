class TeeThreeEngine {
  constructor(rules) {
    this.width = rules.width
    this.height = rules.height
    this.toWin = rules.toWin
    this.misere = rules.misere
    this.name = 'teethree'

    this.reset()
  }

  static getEntry() {
    return {
      name: "Tic Tac Toe",
      description: "3 by 3 board. Get 3 in a row to win.",
      settings: new GameRules([
        new GameRuleEntry({
          name: "width",
          desc: "Board Width",
          type: {
            name: 'integer',
            lowerBound: 2,
          },
          default: 3,
        }),
        new GameRuleEntry({
          name: "height",
          desc: "Board Height",
          type: {
            name: 'integer',
            lowerBound: 2,
          },
          default: 3,
        }),
        new GameRuleEntry({
          name: "toWin",
          desc: "Tiles to win",
          type: {
            name: 'integer',
            lowerBound: 2,
          },
          default: 3,
        }),
        new GameRuleEntry({
          name: "misere",
          desc: "Misere rules",
          type: {
            name: 'boolean',
          },
          default: false,
        }),
      ]),
      run: (rules) => new TeeThreeEngine(rules),
    }
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
        return this.makeMove(action.x, action.y)
    }
  }

  // Check for all possible wins and return the first win.
  checkWin(player) {
    let wins = this.grid.allKInARows(this.toWin, player)
    return (wins.length !== 0)
    ? {
      player: (!this.misere) ? this.turn : -this.turn,
      tiles: wins[0],
    }
    : null
  }
  

  makeMove(x, y) {
    if (this.grid.get(x, y) !== null || this.outcome !== null) { return false }
    
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

    if (this.outcome !== null) {
      this.sendAction({
        name: 'gameOver',
        winner: this.outcome.player
      })
    }

    return true
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

    this.internalGrid = engine.grid.clone()

    this.gridView = new GridView(
      this.gameContainer,
      () => { return this.isTranslating() },
    )

    this.gridView.buildNewGrid(
      this.internalGrid,
      'hoverable'
    )

    this.gridView.onclick = (pos) => {
      this.sendAction({
        name: 'move',
        x: pos.x,
        y: pos.y,
      })
    }
  }

  rebuildGrid(engine) {
    let newRenderableGrid = new Grid(engine.grid.width, engine.grid.height)

    for (let y = 0; y < engine.grid.height; y++) {
      for (let x = 0; x < engine.grid.width; x++) {
        const entry = engine.grid.get(x, y)
        if (entry === 1) {
          newRenderableGrid.set(x, y, 'red bx bx-x')
        } else if (entry === -1) {
          newRenderableGrid.set(x, y, 'blue bx bx-radio-circle')
        } else {
          newRenderableGrid.set(x, y, 'hoverable')
        }
      }
    }

    this.internalGrid = engine.grid.clone()
    this.gridView.buildNewGrid(newRenderableGrid, 'hoverable')
  }

  // Updates the view with the current game state.
  render(engine) {
    for (let y = 0; y < engine.grid.height; y++) {
      for (let x = 0; x < engine.grid.width; x++) {
        const entry = engine.grid.get(x, y)
        const oldEntry = this.internalGrid.get(x, y)
        let newClassList = ''

        const winPrefix =
          (engine.outcome &&
           engine.outcome.tiles.some((p) => 
            p.x === x && p.y === y  
           ))
          ? 'win-'
          : ''

        if (entry !== oldEntry) {
          newClassList += 'newcell '
        }

        if (entry === 1) {
          newClassList += `${winPrefix}red bx bx-x`
        } else if (entry === -1) {
          newClassList += `${winPrefix}blue bx bx-radio-circle`
        } else if (!engine.outcome) {
          newClassList += `hoverable`
        }

        this.gridView.update(x, y, newClassList)
        this.internalGrid.set(x, y, entry)
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
      return '<i class=\'red bx bx-x\'></i>'
    } else {
      return '<i class=\'blue bx bx-radio-circle\'></i>'
    }
  }
}