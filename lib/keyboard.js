window.addEventListener('keyup', e => {
  Key.onKeyup(e)
})

window.addEventListener('keydown', e => {
  Key.onKeydown(event)
})

const Key = {
  _pressed: {},

  A: 65,
  W: 87,
  D: 68,
  S: 83,
  LR: 37,
  RR: 39,
  UR: 38,
  DR: 40,
  SPACE: 32,

  isDown: function (keyCode) {
    return this._pressed[keyCode]
  },
  onKeydown: function (event) {
    this._pressed[event.keyCode] = true
  },
  onKeyup: function (event) {
    delete this._pressed[event.keyCode]
  }
}
