// TODO: Maybe make the game area scrollable and make the margin widths dynamic
// as well.
// TODO: Animations should not restart when you expand the board
// TODO: Add responsive design stuff as well
// TODO: Add additional variants (misere tic tac toe, for instance)
// TODO: Settings menu to set game parameters.
// TODO: Maybe some fun CSS effects in the background, it's otherwise kind of sparse.
// TODO: Add a proper menu system (this'll give me practice with writing other
// games)

class App {
  constructor() {
    this.runner = new GameRunner(this)
    this.menu = new Menu(this)
    this.popup = null
  }

  initialize() {
    this.menu.initialize(gameEntries)
    this.runner.getDOMElements()

    this.dimmer = document.getElementById('dimmer')
    this.dimmer.classList.add('hidden')

    this.openMenu()
  }

  startGame(entry, rules) {
    this.menu.menuWindow.classList.add('hidden')
    this.runner.container.classList.remove('hidden')
    this.runner.startGame(entry, rules)
  }

  openMenu() {
    this.menu.menuWindow.classList.remove('hidden')
    this.runner.container.classList.add('hidden')
  }

  addPopup(elem) {
    this.dimmer.classList.remove('hidden')
    this.dimmer.appendChild(elem)
  }

  clearPopup() {
    this.dimmer.textContent = ''
    this.dimmer.classList.add('hidden')
  }
}

let app = new App()

document.addEventListener('DOMContentLoaded', (event) => {
  app.initialize()
})
